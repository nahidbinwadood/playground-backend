import { User } from './user.model';

// get all users==>
const getAllUsers = async () => {
  const allUsers = await User.find({}).select('-password');

  return allUsers;
};

export const UserServices = {
  getAllUsers,
};
