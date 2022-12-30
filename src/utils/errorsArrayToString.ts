import { ValidationError } from "express-validator";

const errorsArrayToString = (errorsArray: ValidationError[]) => {
    let errors = "";
    for (const index in errorsArray) {
        errors += errorsArray[index].msg + " ";
    }
    return errors;
};
export default errorsArrayToString;
