import axios from 'axios';

const instance = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}/api/`, // URL base del API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token de autenticación a cada solicitud
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    response => response,
    error => {
      // Manejo global de errores
    if (error.response.status === 401) {
        // Redirigir al usuario al login si no está autenticado
        window.location.href = '/login';
    }
    return Promise.reject(error);
});


export default instance;
