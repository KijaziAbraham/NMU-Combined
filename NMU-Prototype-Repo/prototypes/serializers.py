from rest_framework import serializers
from .models import CustomUser, Prototype, PrototypeAttachment, Department
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "username", "level", "role_display",
            "level_display", "is_staff", "is_active",
            "role", "is_approved", "full_name",
            "department", "phone", "institution_id"
        ]

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PrototypeAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrototypeAttachment
        fields = ['report', 'source_code']
class PrototypeSerializer(serializers.ModelSerializer):
    attachment = PrototypeAttachmentSerializer(required=True)
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student'),
        required=False,
        error_messages={
            'does_not_exist': 'Specified user is not a student',
            'incorrect_type': 'Invalid student ID'
        }
    )
    department = DepartmentSerializer(read_only=True)
    supervisors = UserSerializer(many=True, read_only=True)
    supervisor_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), write_only=True, source='supervisors'
    )
    reviewer = UserSerializer(required=False)
    # project_link = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    #research_group = serializers.CharField(choices=RESEARCH_GROUP_CHOICES, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Prototype
        fields = [
            'id', 'student', 'title', 'abstract', 'department','supervisor_ids',
            'academic_year', 'supervisors', 'submission_date',
            'status', 'has_physical_prototype', 'barcode',
            'storage_location', 'feedback', 'reviewer', 'attachment', 'research_group','project_link',
        ]
        read_only_fields = ['id', 'submission_date', 'status', 'barcode', 'department']

    def validate(self, data):
        request = self.context.get('request')
        
        # Handle student assignment
        if 'student' not in data and request and request.user.is_authenticated:
            if request.user.role == 'student':
                data['student'] = request.user
            elif request.user.role == 'admin':
                raise serializers.ValidationError(
                    {'student': 'Student field is required for admin submissions'}
                )
        
        student = data.get('student')
        if not student:
            raise serializers.ValidationError({'student': 'Student is required'})
            
        if not hasattr(student, 'department') or not student.department:
            raise serializers.ValidationError(
                {'student': f'Student {student.username} has no department assigned'}
            )
            
        return data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Convert student ID to nested representation
        if 'student' in representation:
            representation['student'] = UserSerializer(instance.student).data
        
        # Convert supervisor ID to nested representation if exists
        if instance.supervisors and 'supervisors' in representation:
             representation['supervisors'] = UserSerializer(instance.supervisors.all(), many=True).data

        
        # Convert reviewer ID to nested representation if exists
        if instance.reviewer and 'reviewer' in representation:
            representation['reviewer'] = UserSerializer(instance.reviewer).data
        
        return representation

    def create(self, validated_data):
        attachment_data = validated_data.pop('attachment')
        student = validated_data['student']
        supervisors = validated_data.pop('supervisors', [])

        if supervisors and len(supervisors) > 5:
            raise serializers.ValidationError({"supervisors": "You can assign up to 5 supervisors only."})

        # Set department from student
        validated_data['department'] = student.department

        prototype = Prototype.objects.create(**validated_data)

        if supervisors:
            prototype.supervisors.set(supervisors)

        PrototypeAttachment.objects.create(prototype=prototype, **attachment_data)
        return prototype

class PrototypeReviewSerializer(serializers.Serializer):
    feedback = serializers.CharField(required=True)
    status = serializers.ChoiceField(choices=[
        ('submitted_not_reviewed', 'Submitted (Not Reviewed)'),
        ('submitted_reviewed', 'Submitted (Reviewed)'),
    ])

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.feedback = validated_data.get('feedback', instance.feedback)
        supervisors = validated_data.pop('supervisors', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if supervisors is not None:
            instance.supervisors.set(supervisors)
        return instance

class GeneralUserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'phone']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone=validated_data.get('phone', ''),
            role='general_user',
            is_approved=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user