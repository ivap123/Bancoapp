import React  from "react";
import { db, auth } from '../firebase/config';
import { collection, addDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";


const FormRegister = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      
      await addDoc(collection(db, "usuarios"), {
        uid: user.uid,          
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rut: data.rut,
        fecha: data.fecha,
        creado: new Date().toISOString()
      });

      alert("Usuario registrado correctamente!");
      e.target.reset();

    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      alert("Error: " + error.message);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Nombre:</label>
        <input type="text" id="nombre" name="nombre" required  placeholder="Nombre" />
      </div>
      <div>
        <label htmlFor="name">Apellido</label>
        <input type="text" id="apellido" name="apellido" required  placeholder="Apellido" />
      </div>
      <div>
        <label htmlFor="email">Correo electrónico:</label>
        <input type="email" id="email" name="email" required   placeholder="ejemplo@ejemplo.com"/>
      </div>
      <div>
        <label htmlFor="email">Rut</label>
        <input type="text" id="rut" name="rut" required  placeholder="11.111.111-1" />
      </div>
      <div>
        <label htmlFor="email">Fecha de Nacimiento</label>
        <input type="date" id="fecha" name="fecha" required  />
      </div>
       <div>
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required placeholder="Contraseña" />
      </div>
      <button type="submit">Registrar</button>
      
    </form>
    
  );
}


export default FormRegister;