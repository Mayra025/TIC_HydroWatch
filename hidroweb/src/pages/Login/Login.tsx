
import FormL from "../../componentes/FormL/FormL"
import LoginIllustration from "../../componentes/LoginIllustration/LoginIllustration"
import illustration from "../../assets/w.jpg";


export const Login = () => {
    return (
        <div style={{ fontFamily: "ABeeZee" }}>
            <LoginIllustration illustrationBackground={illustration}>
                <FormL></FormL>
            </LoginIllustration>
        </div>


    )
} 
