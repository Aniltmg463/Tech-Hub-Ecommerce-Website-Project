import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Protected Routes token base
export const requireSignIn = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        console.log('🔐 Auth middleware - checking token for:', req.method, req.originalUrl);
        
        if (!authHeader) {
            console.log('❌ No authorization header found');
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: Missing authorization header"
            });
        }
        
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        console.log('🎫 Token extracted:', token ? `${token.substring(0, 20)}...` : 'EMPTY');
        
        if (!token) {
            console.log('❌ No token found in authorization header');
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: Missing token"
            });
        }
        
        const decode = JWT.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user:', decode._id);
        req.user = decode;
        next();
    } catch (error) {
        console.log('💥 Token verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: Token expired"
            });
        }
        return res.status(401).json({ 
            success: false,
            message: "Unauthorized: Invalid token"
        });
    }
    };

    //admin access
    export const isAdmin = async (req, res, next) => {
        try{
            console.log('👑 Admin middleware - checking admin role for user:', req.user._id);
            const user = await userModel.findById(req.user._id);
            
            if (!user) {
                console.log('❌ User not found in database:', req.user._id);
                return res.status(401).send({
                    success: false,
                    message: 'User not found'
                });
            }
            
            console.log('👤 User found:', user.name, '| Role:', user.role);
            
            if(user.role !== 1){
                console.log('⛔ Access denied - user is not admin. Role:', user.role);
                return res.status(401).send({
                    success: false,
                    message: 'Unauthorized: Admin access required'
                });    
            } else {
                console.log('✅ Admin access granted for user:', user.name);
                next();
            }
        } catch (error) {
            console.log('💥 Admin middleware error:', error);
            res.status(401).send({
                success: false,
                error: error.message,
                message: "Error in admin middleware"
            });
        }
    }