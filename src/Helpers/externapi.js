import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASEURL;

const fetchData = async (urlPath, axiosBody) => {
    try {
        const config = {
            method: "POST",
            url: baseUrl + urlPath,
            Headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            data: axiosBody
        }
        const response = await axios(config);
       
        return response.data;

    } catch (error) {
        console.error('Error while fetching data ', error);
        return;
    }

}

const fetchAllData = async (urlPath) => {
    try {
        const config = {
            method: "GET",
            url: baseUrl + urlPath,
            Headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
        // const response = await axios.get(baseUrl + urlPath);
        const response = await axios(config);
        return response.data;

    } catch (error) {
        console.error('Error while fetching data ', urlPath);
        return;
    }
}

const fetchUpdateData = async (urlPath, axiosBody) => {
    try {
        const config = {
            method: "PUT",
            url: baseUrl + urlPath,
            Headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            data: axiosBody
        }
        const response = await axios(config);
        return response.data;

    } catch (error) {
        console.error('Error while fetching data ', error);
        return;
    }

}

const fetchDeleteData = async (urlPath, axiosBody) => {
    try {
        const config = {
            method: "DELETE",
            url: baseUrl + urlPath,
            Headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            data: axiosBody
        }
        const response = await axios(config);
        return response.data;

    } catch (error) {
        console.error('Error while fetching data ', error);
        return;
    }

}

const uploadImage = async (urlPath, formData) => {
    try {
        const config = {
            method: "POST",
            url: baseUrl + urlPath,
            headers: {
                "Content-Type": "multipart/form-data",
                "Access-Control-Allow-Origin": "*"
            },
            data: formData, maxContentLength: 26214400, maxBodyLength: 26214400
        };

        const response = await axios(config);
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

export { fetchData, fetchAllData, fetchUpdateData, fetchDeleteData, uploadImage, fetchImage};