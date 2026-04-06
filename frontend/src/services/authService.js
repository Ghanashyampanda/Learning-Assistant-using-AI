import axioInstance from "../utils/axioInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const login = async (email, password) => {
    try {
        const response = await axioInstance.post(API_PATHS.AUTH.LOGIN, {
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

const register = async (username, email, password) => {
    try {
        const response = await axioInstance.post(API_PATHS.AUTH.REGISTER, {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

const getProfile = async () => {
    try {
        const response = await axioInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

const updateProfile = async (userdata) => {
    try {
        const response = await axioInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userdata);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

const changePassword = async (passwords) => {
    try {
        const response = await axioInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

const authService = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
};

export default authService;