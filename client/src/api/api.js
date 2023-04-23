import axios from 'axios';

export const getUsers = () => {
    return axios.get('/api/users');
};

export const getUserById = (userId) => {
    return axios.get(`/api/users/${userId}`);
};

export const createUser = (user) => {
    return axios.post('/api/users', user);
};

export const updateUser = (userId, updatedUser) => {
    return axios.put(`/api/users/${userId}`, updatedUser);
};

export const deleteUser = (userId) => {
    return axios.delete(`/api/users/${userId}`);
};
