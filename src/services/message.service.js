"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
// services/messageService.ts
const message_1 = require("../models/message");
const user_1 = require("../models/user");
const mongoose_1 = __importDefault(require("mongoose"));
class MessageService {
    sendMessage(senderId, receiverId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validación básica
            if (!content || typeof content !== 'string' || content.trim().length === 0) {
                throw new Error('El contenido del mensaje es requerido');
            }
            // Buscar usuarios (solo disponibles)
            const [sender, receiver] = yield Promise.all([
                user_1.UserModel.findOne({ _id: senderId, available: true }),
                user_1.UserModel.findOne({ _id: receiverId, available: true })
            ]);
            if (!sender)
                throw new Error('Remitente no encontrado o no disponible');
            if (!receiver)
                throw new Error('Destinatario no encontrado o no disponible');
            // Crear y guardar el mensaje
            const newMessage = new message_1.MessageModel({
                content: content.trim(),
                sender: sender._id,
                receiver: receiver._id,
                read: false,
                createdAt: new Date()
            });
            return yield newMessage.save();
        });
    }
    /**
     * Obtiene todos los mensajes entre dos usuarios
     * @param userId1 ID del primer usuario
     * @param userId2 ID del segundo usuario
     * @returns Lista de mensajes ordenados por fecha de creación (más recientes primero)
     * @throws Error si los IDs son inválidos
     */
    getMessagesBetweenUsers(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validar los IDs
            return yield message_1.MessageModel.find({
                $or: [
                    { sender: userId1, receiver: userId2 },
                    { sender: userId2, receiver: userId1 }
                ]
            })
                .sort({ createdAt: -1 }) // Orden descendente (más reciente primero)
                .populate('sender', 'name email') // Popula datos básicos del remitente
                .populate('receiver', 'name email') // Popula datos básicos del destinatario
                .exec();
        });
    }
    /**
      * Actualiza el contenido de un mensaje existente
      * @param messageId ID del mensaje a actualizar
      * @param newContent Nuevo contenido del mensaje
      * @param senderId ID del remitente (para validación de propiedad)
      * @returns Mensaje actualizado
      * @throws Error si el mensaje no existe o no pertenece al remitente
      */
    updateMessage(messageId, newContent, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validaciones básicas
            if (!mongoose_1.default.Types.ObjectId.isValid(messageId)) {
                throw new Error('ID de mensaje inválido');
            }
            if (!newContent || typeof newContent !== 'string' || newContent.trim().length === 0) {
                throw new Error('El contenido del mensaje es requerido');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(senderId)) {
                throw new Error('ID de remitente inválido');
            }
            // Buscar y actualizar el mensaje
            const updatedMessage = yield message_1.MessageModel.findOneAndUpdate({
                _id: messageId,
                sender: senderId // Solo permite actualizar si el sender es el dueño
            }, {
                $set: {
                    content: newContent.trim(),
                    updatedAt: new Date()
                }
            }, {
                new: true, // Devuelve el documento actualizado
                runValidators: true // Ejecuta las validaciones del schema
            }).populate('sender', 'name email')
                .populate('receiver', 'name email');
            if (!updatedMessage) {
                throw new Error('Mensaje no encontrado o no tienes permiso para editarlo');
            }
            return updatedMessage;
        });
    }
    /**
     * Elimina un mensaje existente
     * @param messageId ID del mensaje a eliminar
     * @param senderId ID del remitente (para validación de propiedad)
     * @returns Mensaje eliminado
     * @throws Error si el mensaje no existe o no pertenece al remitente
     */
    deleteMessage(messageId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validaciones básicas
            if (!mongoose_1.default.Types.ObjectId.isValid(messageId)) {
                throw new Error('ID de mensaje inválido');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(senderId)) {
                throw new Error('ID de remitente inválido');
            }
            // Buscar y eliminar el mensaje
            const deletedMessage = yield message_1.MessageModel.findOneAndDelete({
                _id: messageId,
                sender: senderId // Solo permite eliminar si el sender es el dueño
            }).populate('sender', 'name email')
                .populate('receiver', 'name email');
            if (!deletedMessage) {
                throw new Error('Mensaje no encontrado o no tienes permiso para eliminarlo');
            }
            return deletedMessage;
        });
    }
}
exports.MessageService = MessageService;
exports.default = new MessageService();
