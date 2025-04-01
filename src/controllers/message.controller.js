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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getMessagesBetweenUsers = getMessagesBetweenUsers;
exports.updateMessage = updateMessage;
exports.deleteMessage = deleteMessage;
const message_service_1 = require("../services/message.service");
const messageService = new message_service_1.MessageService();
/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Mensajería entre usuarios
 */
/**
 * @swagger
 * /api/messages/{senderId}/{receiverId}:
 *   post:
 *     summary: Envía un mensaje entre usuarios
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario remitente
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario destinatario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenido del mensaje
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Usuario no encontrado
 */
function sendMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { senderId, receiverId } = req.params;
            const { content } = req.body;
            const message = yield messageService.sendMessage(senderId, receiverId, content);
            res.status(201).json(message);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('no encontrado')) {
                    res.status(404).json({ error: error.message });
                }
                else {
                    res.status(400).json({ error: error.message });
                }
            }
            else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    });
}
/**
 * @swagger
 * /api/messages/{userId1}/{userId2}:
 *   get:
 *     summary: Obtiene todos los mensajes entre dos usuarios
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId1
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del primer usuario
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del segundo usuario
 *     responses:
 *       200:
 *         description: Lista de mensajes entre los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: IDs de usuario inválidos
 *       404:
 *         description: No se encontraron mensajes
 */
function getMessagesBetweenUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId1, userId2 } = req.params;
            const messages = yield messageService.getMessagesBetweenUsers(userId1, userId2);
            if (messages.length === 0) {
                res.status(404).json({ message: 'No se encontraron mensajes entre estos usuarios' });
                return;
            }
            res.status(200).json(messages);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('inválido')) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: error.message });
                }
            }
            else {
                res.status(500).json({ error: 'Error desconocido al obtener mensajes' });
            }
        }
    });
}
/**
 * @swagger
 * /api/messages/{messageId}:
 *   patch:
 *     summary: Actualiza el contenido de un mensaje
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nuevo contenido del mensaje
 *               senderId:
 *                 type: string
 *                 description: ID del remitente (para validación)
 *             required:
 *               - content
 *               - senderId
 *     responses:
 *       200:
 *         description: Mensaje actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error en los datos proporcionados
 *       403:
 *         description: No tienes permiso para editar este mensaje
 *       404:
 *         description: Mensaje no encontrado
 */
function updateMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { messageId } = req.params;
            const { content, senderId } = req.body;
            if (!content || !senderId) {
                res.status(400).json({ error: 'content y senderId son requeridos' });
                return;
            }
            const updatedMessage = yield messageService.updateMessage(messageId, content, senderId);
            res.status(200).json(updatedMessage);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('inválido')) {
                    res.status(400).json({ error: error.message });
                }
                else if (error.message.includes('no tienes permiso')) {
                    res.status(403).json({ error: error.message });
                }
                else if (error.message.includes('no encontrado')) {
                    res.status(404).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: error.message });
                }
            }
            else {
                res.status(500).json({ error: 'Error desconocido al actualizar mensaje' });
            }
        }
    });
}
/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Elimina un mensaje permanentemente
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje a eliminar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: ID del remitente (para validación)
 *             required:
 *               - senderId
 *     responses:
 *       200:
 *         description: Mensaje eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error en los datos proporcionados
 *       403:
 *         description: No tienes permiso para eliminar este mensaje
 *       404:
 *         description: Mensaje no encontrado
 */
function deleteMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { messageId } = req.params;
            const { senderId } = req.body;
            if (!senderId) {
                res.status(400).json({ error: 'senderId es requerido' });
                return;
            }
            const deletedMessage = yield messageService.deleteMessage(messageId, senderId);
            res.status(200).json(deletedMessage);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('inválido')) {
                    res.status(400).json({ error: error.message });
                }
                else if (error.message.includes('no tienes permiso')) {
                    res.status(403).json({ error: error.message });
                }
                else if (error.message.includes('no encontrado')) {
                    res.status(404).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: error.message });
                }
            }
            else {
                res.status(500).json({ error: 'Error desconocido al eliminar mensaje' });
            }
        }
    });
}
