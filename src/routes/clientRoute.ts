import { Router } from 'express';
import { clientController } from '../controllers/clientController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, clientController.create);
router.get('/', authMiddleware, clientController.list);
router.put('/:id', authMiddleware, clientController.update);
router.delete('/:id', authMiddleware, clientController.delete);

export default router;