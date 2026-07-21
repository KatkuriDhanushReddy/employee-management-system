const { wouldCreateCycle } = require('../src/utils/hierarchy');

describe('Hierarchy Utils', () => {
  describe('wouldCreateCycle', () => {
    it('should return false when managerId is null', async () => {
      const result = await wouldCreateCycle('507f1f77bcf86cd799439011', null);
      expect(result).toBe(false);
    });

    it('should return true when employee is their own manager', async () => {
      const id = '507f1f77bcf86cd799439011';
      const result = await wouldCreateCycle(id, id);
      expect(result).toBe(true);
    });
  });
});
