import { envVariables } from "../config/env";
import { IauthProvider, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVariables.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super Admin Already Exist!!");
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      envVariables.SUPER_ADMIN_PASSWORD,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );

    const authProvider: IauthProvider = {
      provider: "credentials",
      providerId: envVariables.SUPER_ADMIN_EMAIL,
    };

    const payload = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVariables.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      auths: [authProvider],
    };
    const superAdmin = await User.create(payload);
    console.log("Super Admin Created Successfully", superAdmin);
  } catch (error) {
    console.log(error);
  }
};
