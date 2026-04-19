import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getPhotos, loginAdmin, uploadPhoto, deletePhoto } from '../services/api';

const Admin = () => {
    const { t } = useLanguage();
    const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
    const [photos, setPhotos] = useState([]);

    const [loginData, setLoginData] = useState({ username: '', password: '' });

    const [uploadData, setUploadData] = useState({
        name: '',
        item_description: '',
        price: '',
        file: null,
        size_table_photo: null,
        sizes: []
    });

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await loginAdmin(loginData.username, loginData.password);
            setToken(data.access_token);
            localStorage.setItem('admin_token', data.access_token);
        } catch (error) {
            alert('Login failed');
        }
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('admin_token');
    };

    const fetchPhotos = async () => {
        try {
            const data = await getPhotos();
            setPhotos(data);
        } catch (error) {
            console.error("Error fetching photos", error);
        }
    };

    useEffect(() => {
        if (token) fetchPhotos();
    }, [token]);

    const handleUploadChange = (e) => {
        const { name, value, type, files, checked } = e.target;
        if (type === 'file') {
            setUploadData({ ...uploadData, [name]: files[0] });
        } else if (type === 'checkbox') {
            const newSizes = checked
                ? [...uploadData.sizes, value]
                : uploadData.sizes.filter(s => s !== value);
            setUploadData({ ...uploadData, sizes: newSizes });
        } else {
            setUploadData({ ...uploadData, [name]: value });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('item', uploadData.file); // Backend expects 'item' for main file
        if (uploadData.size_table_photo) formData.append('size_table_photo', uploadData.size_table_photo);
        if (uploadData.name) formData.append('name', uploadData.name);
        if (uploadData.item_description) formData.append('item_description', uploadData.item_description);
        if (uploadData.price) formData.append('price', uploadData.price);
        formData.append('sizes', JSON.stringify(uploadData.sizes)); // Backend expects JSON string

        try {
            await uploadPhoto(formData, token);
            alert('Uploaded successfully');
            fetchPhotos();
            setUploadData({ name: '', item_description: '', price: '', file: null, size_table_photo: null, sizes: [] });
            document.getElementById("uploadForm").reset(); // reset file inputs
        } catch (error) {
            alert('Upload failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        try {
            await deletePhoto(id, token);
            fetchPhotos();
        } catch (error) {
            alert('Delete failed');
        }
    };

    if (!token) {
        return (
            <main style={{ padding: '50px', textAlign: 'center' }}>
                <h2>Admin Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Username: </label>
                        <input type="text" name="username" value={loginData.username} onChange={handleLoginChange} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Password: </label>
                        <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required />
                    </div>
                    <button type="submit" className="normal">Login</button>
                </form>
            </main>
        );
    }

    return (
        <main>
            <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
                <h1 data-i18n-key="adminPanel">{t('adminPanel') || 'Панель администратора'}</h1>
                <button onClick={handleLogout} className="normal">Logout</button>
            </header>

            <section className="upload-form" style={{ padding: '20px' }}>
                <h2>{t('uploadNewPhoto') || 'Загрузить новое фото'}</h2>
                <form id="uploadForm" onSubmit={handleUpload}>
                    <label data-i18n-key="mainPhoto">Основное фото:</label>
                    <input type="file" name="file" accept="image/*" onChange={handleUploadChange} required />

                    <label data-i18n-key="sizeTablePhoto">Фото таблицы размеров (необязательно):</label>
                    <input type="file" name="size_table_photo" accept="image/*" onChange={handleUploadChange} />

                    <input type="text" name="name" value={uploadData.name} placeholder={t('name') || "Название"} onChange={handleUploadChange} />
                    <textarea name="item_description" value={uploadData.item_description} placeholder={t('item_description') || "Описание товара"} onChange={handleUploadChange}></textarea>
                    <input type="number" name="price" value={uploadData.price} placeholder={t('price') || "Цена"} required min="0" step="0.01" onChange={handleUploadChange} />

                    <div style={{ margin: '10px 0' }}>
                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <label key={size} style={{ marginRight: '10px' }}>
                                <input type="checkbox" name="sizes" value={size} onChange={handleUploadChange} /> {size}
                            </label>
                        ))}
                    </div>
                    <button type="submit" className="normal">{t('upload') || 'Загрузить'}</button>
                </form>
            </section>

            <section className="gallery" style={{ padding: '20px' }}>
                <h2 data-i18n-key="gallery">{t('gallery') || 'Галерея'}</h2>
                <div className="gallery-container">
                    {photos.map(photo => (
                        <div className="gallery-item" key={photo.id}>
                            <img src={photo.path} alt={photo.description || photo.filename} style={{ width: '100%', height: 'auto' }} />
                            <div className="product-info">
                                <h3>{photo.name || photo.description || photo.filename}</h3>
                                <p className="price">{photo.price ? parseFloat(photo.price).toFixed(2) : "0.00"} UAH</p>
                            </div>
                            <button onClick={() => handleDelete(photo.id)} style={{ backgroundColor: 'red', color: 'white', marginTop: '10px', width: '100%' }}>Delete</button>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Admin;
