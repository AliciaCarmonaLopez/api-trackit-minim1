// services/messageService.ts
import { IMessage, MessageModel } from '../models/message';
import { UserModel } from '../models/user';
import mongoose from 'mongoose';

export class MessageService {
    async sendMessage(
        senderId: string,
        receiverId: string,
        content: string
    ): Promise<IMessage> {
        // Validación básica
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            throw new Error('El contenido del mensaje es requerido');
        }


        // Buscar usuarios (solo disponibles)
        const [sender, receiver] = await Promise.all([
            UserModel.findOne({ _id: senderId, available: true }),
            UserModel.findOne({ _id: receiverId, available: true })
        ]);

        if (!sender) throw new Error('Remitente no encontrado o no disponible');
        if (!receiver) throw new Error('Destinatario no encontrado o no disponible');

        // Crear y guardar el mensaje
        const newMessage = new MessageModel({
            content: content.trim(),
            sender: sender._id,
            receiver: receiver._id,
            read: false,
            createdAt: new Date()
        });

        return await newMessage.save();
    }


    /**
     * Obtiene todos los mensajes entre dos usuarios
     * @param userId1 ID del primer usuario
     * @param userId2 ID del segundo usuario
     * @returns Lista de mensajes ordenados por fecha de creación (más recientes primero)
     * @throws Error si los IDs son inválidos
     */
    async getMessagesBetweenUsers(
        userId1: string,
        userId2: string
    ): Promise<IMessage[]> {
        // Validar los IDs

        return await MessageModel.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        })
        .sort({ createdAt: -1 }) // Orden descendente (más reciente primero)
        .populate('sender', 'name email') // Popula datos básicos del remitente
        .populate('receiver', 'name email') // Popula datos básicos del destinatario
        .exec();
    }

   /**
     * Actualiza el contenido de un mensaje existente
     * @param messageId ID del mensaje a actualizar
     * @param newContent Nuevo contenido del mensaje
     * @param senderId ID del remitente (para validación de propiedad)
     * @returns Mensaje actualizado
     * @throws Error si el mensaje no existe o no pertenece al remitente
     */
   async updateMessage(
    messageId: string,
    newContent: string,
    senderId: string
): Promise<IMessage> {
    // Validaciones básicas
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error('ID de mensaje inválido');
    }

    if (!newContent || typeof newContent !== 'string' || newContent.trim().length === 0) {
        throw new Error('El contenido del mensaje es requerido');
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
        throw new Error('ID de remitente inválido');
    }

    // Buscar y actualizar el mensaje
    const updatedMessage = await MessageModel.findOneAndUpdate(
        {
            _id: messageId,
            sender: senderId // Solo permite actualizar si el sender es el dueño
        },
        {
            $set: {
                content: newContent.trim(),
                updatedAt: new Date()
            }
        },
        {
            new: true, // Devuelve el documento actualizado
            runValidators: true // Ejecuta las validaciones del schema
        }
    ).populate('sender', 'name email')
     .populate('receiver', 'name email');

    if (!updatedMessage) {
        throw new Error('Mensaje no encontrado o no tienes permiso para editarlo');
    }

    return updatedMessage;
}

    /**
     * Elimina un mensaje existente
     * @param messageId ID del mensaje a eliminar
     * @param senderId ID del remitente (para validación de propiedad)
     * @returns Mensaje eliminado
     * @throws Error si el mensaje no existe o no pertenece al remitente
     */
    async deleteMessage(
        messageId: string,
        senderId: string
    ): Promise<IMessage> {
        // Validaciones básicas
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            throw new Error('ID de mensaje inválido');
        }

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            throw new Error('ID de remitente inválido');
        }

        // Buscar y eliminar el mensaje
        const deletedMessage = await MessageModel.findOneAndDelete({
            _id: messageId,
            sender: senderId // Solo permite eliminar si el sender es el dueño
        }).populate('sender', 'name email')
          .populate('receiver', 'name email');

        if (!deletedMessage) {
            throw new Error('Mensaje no encontrado o no tienes permiso para eliminarlo');
        }

        return deletedMessage;
    }
}

export default new MessageService();