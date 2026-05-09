import API from "../APIs/api";

export const fetchUserInfo = async () => {
    try {
        const res = await API.get("/auth/me"); 
        return res.data;
    } catch (err) {
        console.error("fetchUserInfo error:", err.response?.data || err.message);
        throw err;
    }
} 
export const register = async (formData) => {
    try{
        const res = await API.post("/auth/register",formData);
        return res.data;
    } catch (err) { 
        console.error("Register API Error:", err.response?.data || err.message);
        throw err; // ✅ Add this line so error is passed to the calling function
    }
}
export const login = (userData) => API.post("/auth/login", userData);
 
export const logout = async () => {
    try{
        const res = await API.get("/auth/logout");
        return res.data;
    } catch (err) { 
        console.error("Logout API Error:", err.response?.data || err.message);
        throw err; // ✅ Add this line so error is passed to the calling function
    }
} 