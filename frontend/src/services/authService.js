import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/token/`, {
    username,
    password,
  });

  return response.data; // { access, refresh }
};
