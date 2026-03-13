export const validateSignup = (email,password)=>{

 if(!email || !password){
  return "Missing fields"
 }

 if(password.length < 8){
  return "Password must be at least 8 characters"
 }

 return null
}