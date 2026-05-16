import { AuthPage } from "@/components/AuthPage";

export default function Signup() {
    return <AuthPage isSignin={false} />
} 
//this false says when isSignin is true then we have to signin , else we have to do signup 