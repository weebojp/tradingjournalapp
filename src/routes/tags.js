const express = require('express');
const DatabaseService = require('../services/database');
const authMiddleware = require('../middleware/auth');

function createTagsRouter(dbServiceInstance = null) {
  const router = express.Router();
  const dbService = dbServiceInstance || new DatabaseService();

// All tag routes require authentication
router.use(authMiddleware);

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all tags with their associated trades for this user
    const tags = await dbService.prisma.tag.findMany({
      include: {
        trades: {
          include: {
            trade: {
              where: { userId: userId }
            }
          }
        }
      }
    });
    
    // Transform the data to include trade statistics
    const tagsWithStats = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      descriptionMD: tag.descriptionMD,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      trades: tag.trades.map(tradeTag => tradeTag.trade),
      _count: {
        trades: tag.trades.length
      }
    })).filter(tag => tag.trades.length > 0); // Only return tags that have trades
    
    res.json(tagsWithStats);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tags'
    });
  }
});

// GET /api/tags/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const tagId = req.params.id;
    
    const tag = await dbService.prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        trades: {
          include: {
            trade: {
              where: { userId: userId }
            }
          }
        }
      }
    });
    
    if (!tag) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tag not found'
      });
    }
    
    // Transform the data
    const tagWithStats = {
      id: tag.id,
      name: tag.name,
      descriptionMD: tag.descriptionMD,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      trades: tag.trades.map(tradeTag => tradeTag.trade),
      _count: {
        trades: tag.trades.length
      }
    };
    
    res.json(tagWithStats);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tag'
    });
  }
});

// POST /api/tags
router.post('/', async (req, res) => {
  try {
    const { name, descriptionMD } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Tag name is required'
      });
    }
    
    // Check if tag already exists
    const existingTag = await dbService.findTagByName(name);
    if (existingTag) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Tag with this name already exists'
      });
    }
    
    const tag = await dbService.createTag({
      name,
      descriptionMD: descriptionMD || ''
    });
    
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create tag'
    });
  }
});

// PUT /api/tags/:id
router.put('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;
    const { name, descriptionMD } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (descriptionMD !== undefined) updateData.descriptionMD = descriptionMD;
    
    const tag = await dbService.updateTag(tagId, updateData);
    
    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Tag not found'
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update tag'
      });
    }
  }
});

// DELETE /api/tags/:id
router.delete('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;
    
    await dbService.deleteTag(tagId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tag:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Tag not found'
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete tag'
      });
    }
  }
});

  return router;
}

// Export default instance
module.exports = createTagsRouter();

// Export factory function for testing
module.exports.createTagsRouter = createTagsRouter;