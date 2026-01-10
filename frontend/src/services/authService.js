import axios from "axios";

export const loginUser = async (username, password) => {
  const response = await axios.post(
    "http://127.0.0.1:8000/api/token/",
    { username, password }
  );
  return response.data;
};

