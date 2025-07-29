const Tag = require('../../../src/models/Tag');

describe('Tag Model', () => {
  describe('constructor', () => {
    test('should create a tag with required name', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      expect(tag.name).toBe('MA-Cross');
      expect(tag.id).toBeDefined();
      expect(tag.createdAt).toBeInstanceOf(Date);
      expect(tag.descriptionMD).toBe('');
    });

    test('should create a tag with description', () => {
      const tag = new Tag({
        name: 'Breakout',
        descriptionMD: '# Breakout Strategy\n\nBreak above resistance level'
      });
      
      expect(tag.name).toBe('Breakout');
      expect(tag.descriptionMD).toBe('# Breakout Strategy\n\nBreak above resistance level');
    });
  });

  describe('validation', () => {
    test('should throw error for missing name', () => {
      expect(() => {
        new Tag({});
      }).toThrow('Tag name is required');
    });

    test('should throw error for empty name', () => {
      expect(() => {
        new Tag({ name: '' });
      }).toThrow('Tag name cannot be empty');
    });

    test('should throw error for name with special characters', () => {
      expect(() => {
        new Tag({ name: 'Invalid@Tag!' });
      }).toThrow('Tag name can only contain letters, numbers, hyphens, and underscores');
    });

    test('should allow valid tag names', () => {
      const validNames = ['MA-Cross', 'RSI_Divergence', 'Pattern123', 'simple'];
      
      validNames.forEach(name => {
        expect(() => new Tag({ name })).not.toThrow();
      });
    });

    test('should throw error for name longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(() => {
        new Tag({ name: longName });
      }).toThrow('Tag name must be 50 characters or less');
    });
  });

  describe('name uniqueness', () => {
    test('should normalize name for comparison', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      expect(tag.normalizedName).toBe('ma-cross');
    });

    test('should treat different cases as same tag', () => {
      const tag1 = new Tag({ name: 'MA-Cross' });
      const tag2 = new Tag({ name: 'ma-cross' });
      const tag3 = new Tag({ name: 'Ma-CrOsS' });
      
      expect(tag1.normalizedName).toBe(tag2.normalizedName);
      expect(tag2.normalizedName).toBe(tag3.normalizedName);
    });
  });

  describe('strategy note', () => {
    test('should update strategy note content', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      const newContent = `# MA Cross Strategy
      
## Entry Rules
- 20 MA crosses above 50 MA
- Volume confirmation

## Exit Rules
- Stop loss at 2%
- Take profit at 5%`;
      
      tag.updateStrategyNote(newContent);
      
      expect(tag.descriptionMD).toBe(newContent);
      expect(tag.updatedAt).toBeInstanceOf(Date);
    });

    test('should track updated timestamp', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      const initialTime = tag.updatedAt;
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        tag.updateStrategyNote('Updated content');
        expect(tag.updatedAt.getTime()).toBeGreaterThan(initialTime.getTime());
      }, 10);
    });
  });

  describe('statistics', () => {
    test('should initialize with zero statistics', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      expect(tag.tradeCount).toBe(0);
      expect(tag.winCount).toBe(0);
      expect(tag.lossCount).toBe(0);
      expect(tag.winRate).toBe(0);
    });

    test('should calculate win rate correctly', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      tag.addTradeResult(true);  // win
      tag.addTradeResult(true);  // win
      tag.addTradeResult(false); // loss
      tag.addTradeResult(true);  // win
      
      expect(tag.tradeCount).toBe(4);
      expect(tag.winCount).toBe(3);
      expect(tag.lossCount).toBe(1);
      expect(tag.winRate).toBe(0.75); // 75%
    });

    test('should handle all wins', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      tag.addTradeResult(true);
      tag.addTradeResult(true);
      
      expect(tag.winRate).toBe(1); // 100%
    });

    test('should handle all losses', () => {
      const tag = new Tag({ name: 'MA-Cross' });
      
      tag.addTradeResult(false);
      tag.addTradeResult(false);
      
      expect(tag.winRate).toBe(0); // 0%
    });
  });

  describe('toJSON', () => {
    test('should include all relevant fields', () => {
      const tag = new Tag({
        name: 'MA-Cross',
        descriptionMD: '# Strategy description'
      });
      
      tag.addTradeResult(true);
      tag.addTradeResult(false);
      
      const json = tag.toJSON();
      
      expect(json).toEqual({
        id: tag.id,
        name: 'MA-Cross',
        descriptionMD: '# Strategy description',
        tradeCount: 2,
        winCount: 1,
        lossCount: 1,
        winRate: 0.5,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      });
    });
  });
});