const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Intentando login en http://localhost:8000/login');
    
    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en el servidor');
        }

        const data = await response.json();
        console.log('Login exitoso:', data);
        // Aquí puedes redirigir al usuario o actualizar el estado
        
    } catch (error) {
        console.error('Error completo:', error);
        // Aquí puedes mostrar un mensaje de error al usuario
    }
}; 