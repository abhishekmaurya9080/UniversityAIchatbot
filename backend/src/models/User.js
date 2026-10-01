import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    studentId: {
      type: String,
      unique: true,
      default: () => `STU${Math.floor(100000 + Math.random() * 900000)}`,
    },
    course: {
      type: String,
      default: 'B.Tech Computer Science',
    },
    semester: {
      type: String,
      default: '3rd Semester',
    },
    rollNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Remove password from JSON serialization
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
