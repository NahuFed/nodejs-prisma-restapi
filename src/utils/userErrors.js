import AppError from "./appError.js";

export const userNotFound = (id) =>
  new AppError(`Usuario con id ${id} no encontrado`, 404);

export const emailAlreadyExists = (email) =>
  new AppError(`El email ${email} ya está registrado`, 400);