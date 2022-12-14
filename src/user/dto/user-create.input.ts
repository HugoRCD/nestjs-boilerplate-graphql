import {Field, InputType, Int} from "@nestjs/graphql";
import {IsAlpha, IsDate, IsEmail, IsNotEmpty, IsPhoneNumber} from "class-validator";

@InputType()
export class CreateUserInput {
  @Field(() => String)
    username: string;

  @IsAlpha()
  @Field(() => String)
    firstname: string;

  @IsAlpha()
  @Field(() => String)
    lastname: string;

  @IsEmail()
  @Field(() => String)
    email: string;

  @IsNotEmpty()
  @Field(() => String)
    password: string;

  @Field(() => Int, {nullable: true})
    role: number;

  @Field(() => String, {nullable: true})
    avatar?: string;

  @IsPhoneNumber("FR")
  @Field(() => String)
    phone: string;

  @IsDate()
  @Field(() => Date)
    birthdate: Date;
}
