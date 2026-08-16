from rest_framework import serializers
from .models import User


class SignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "mobile", "password", "confirm_password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_mobile(self, value):
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile number already exists")
        return value

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
            name=validated_data["name"],
            email=validated_data["email"],
            mobile=validated_data["mobile"],
            password=validated_data["password"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TOTPSetupSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, required=False)


class TOTPVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "mobile", "totp_enabled"]
