import {Schema, model, Document} from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'The name is necessary']
    },
    lastName: {
        type: String,
        required: [true, 'The last name is necessary']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'The email is necessary']
    },
    password: {
        type: String,
        required: [true, 'The password is necessary']
    },
    savedRepositories: {
        type: [Schema.Types.ObjectId],
        ref: 'Repository',
        default: []
    },
    createdRepositories: {
        type: [Schema.Types.ObjectId],
        ref: 'Repository',
        default: []
    }
});

userSchema.method('comparePassword', function(password: string = ''): boolean {
    if (bcrypt.compareSync(password, this.password)) {
        return true;
    } else {
        return false;
    }
});

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    comparePassword(password: string): boolean;
}

export const User = model<IUser>('User', userSchema);