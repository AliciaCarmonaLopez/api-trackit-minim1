import { Router } from 'express';

const router = Router();

import { 
    deleteMessage,
    getMessagesBetweenUsers,
    sendMessage,
    updateMessage
} from '../controllers/message.controller';

router.post("/:senderId/:recieverId", sendMessage);
router.get("/:senderId/:recieverId", getMessagesBetweenUsers);
router.put("/:messageId", updateMessage)
router.delete("/:messageId", deleteMessage);
export default router;