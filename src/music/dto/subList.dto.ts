import { IsArray, IsNumber } from "class-validator";

export class subListDto {
    @IsArray()
    @IsNumber({}, {each: true})
    subList: number[]
}