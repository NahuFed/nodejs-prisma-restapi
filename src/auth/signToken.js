import jwt from "jsonwebtoken";

const generateToken = (user) => {
    //carga util o datos que quiero guardar en el token
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
            (error, token) => {
                if (error) {
                    return reject(new Error("Error al generar el token"));
                }

                resolve(token);
            }
        );
    });
}

export default generateToken;