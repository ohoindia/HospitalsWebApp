import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASEURL;
const baseUrl_new = process.env.REACT_APP_BASEURL_NEW;

const changeUrlPath = (path) => {
  if (path.includes("lambdaAPI")) {
    return `${baseUrl_new}/${path}`;
  } else {
    return `${baseUrl}/${path}`;
  }
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

const fetchData = async (urlPath, axiosBody) => {
  try {
    const response = await axios({
      method: "POST",
      url: changeUrlPath(urlPath),
      headers: getAuthHeaders(),
      data: axiosBody
    });
    return response.data;
  } catch (error) {
    console.error('Error while fetching data:', error);
    return;
  }
};

const fetchAllData = async (urlPath) => {
  try {
    const response = await axios({
      method: "GET",
      url: changeUrlPath(urlPath),
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error while fetching data:', urlPath, error);
    return;
  }
};

const fetchUpdateData = async (urlPath, axiosBody) => {
  try {
    const response = await axios({
      method: "PUT",
      url: changeUrlPath(urlPath),
      headers: getAuthHeaders(),
      data: axiosBody
    });
    return response.data;
  } catch (error) {
    console.error('Error while updating data:', error);
    return;
  }
};

const fetchDeleteData = async (urlPath, axiosBody) => {
  try {
    const response = await axios({
      method: "DELETE",
      url: changeUrlPath(urlPath),
      headers: getAuthHeaders(),
      data: axiosBody
    });
    return response.data;
  } catch (error) {
    console.error('Error while deleting data:', error);
    return;
  }
};

const uploadImage = async (urlPath, formData) => {
  try {
    const response = await axios({
      method: "POST",
      url: changeUrlPath(urlPath),
      headers: {
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*"
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      data: formData,
      maxContentLength: 26214400,
      maxBodyLength: 26214400
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

const fetchImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error(`Error fetching image: ${error.message}`);
  }
};

const uploadPdf = async (urlPath, formData) => {
  try {
    const response = await axios({
      method: "POST",
      url: changeUrlPath(urlPath),
      headers: {
        "Access-Control-Allow-Origin": "*"
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      data: formData,
      maxContentLength: 26214400,
      maxBodyLength: 26214400
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error(`Error uploading PDF: ${error.message}`);
  }
};

export {
  fetchData,
  fetchAllData,
  fetchUpdateData,
  fetchDeleteData,
  uploadImage,
  fetchImage,
  uploadPdf
};
