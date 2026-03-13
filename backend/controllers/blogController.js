import supabase from "../services/supabaseClient.js"

export const getBlogs = async (req, res) => {

const { data, error } = await supabase
.from("blogs")
.select("*")

if(error){
return res.status(500).json(error)
}

res.json(data)

}

export const createBlog = async (req,res)=>{

const {title,content} = req.body

const {data,error} = await supabase
.from("blogs")
.insert([{title,content}])

if(error){
return res.status(500).json(error)
}

res.json(data)

}