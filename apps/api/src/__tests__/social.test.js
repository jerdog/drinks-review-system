import { createTestUser, createTestBeverage, createTestReview, generateTestToken, testPrisma } from '../test/setup.js';

// Helper to generate a unique suffix for test data
const uniqueSuffix = () => Math.random().toString(36).substring(2, 10);

describe('Social Endpoints', () => {
  let app;
  let user1, user2, user3;
  let testBeverage;
  let testReview;

  beforeAll(async () => {
    // Import the app using dynamic import for ES modules
    const { default: fastifyApp } = await import('../index.js');
    app = fastifyApp;
  });

  afterAll(async () => {
    // Close the app after tests
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Generate unique suffix for this test run
    const suffix1 = uniqueSuffix();
    const suffix2 = uniqueSuffix();
    const suffix3 = uniqueSuffix();
    // Create fresh test users for each test with unique emails/usernames
    user1 = await createTestUser({ username: `user1_${suffix1}`, email: `user1_${suffix1}@example.com` });
    user2 = await createTestUser({ username: `user2_${suffix2}`, email: `user2_${suffix2}@example.com` });
    user3 = await createTestUser({ username: `user3_${suffix3}`, email: `user3_${suffix3}@example.com` });

    // Create fresh test beverage and review for each test
    testBeverage = await createTestBeverage();
    testReview = await createTestReview({
      user: user1,
      beverage: testBeverage,
      content: 'Test review for social features'
    });
  });

  describe('Follow System', () => {
    describe('POST /social/follow/:userId', () => {
      it('should follow a user successfully', async () => {
        const token = generateTestToken(user2);

        const response = await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toContain('User followed successfully');

        // Verify follow relationship in database
        const follow = await testPrisma.follows.findFirst({
          where: {
            followerId: user2.id,
            followingId: user1.id
          }
        });
        expect(follow).toBeDefined();
      });

      it('should return error when trying to follow yourself', async () => {
        const token = generateTestToken(user1);

        const response = await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Cannot follow yourself');
      });

      it('should return error when trying to follow non-existent user', async () => {
        const token = generateTestToken(user1);
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await app.inject({
          method: 'POST',
          url: `/social/follow/${fakeId}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('User not found');
      });

      it('should return error when already following user', async () => {
        const token = generateTestToken(user2);

        // First follow
        await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Try to follow again
        const response = await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Already following');
      });

      it('should return error without authentication', async () => {
        const response = await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });
    });

    describe('DELETE /social/follow/:userId', () => {
      it('should unfollow a user successfully', async () => {
        const token = generateTestToken(user2);

        // First follow the user
        await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Then unfollow
        const response = await app.inject({
          method: 'DELETE',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toContain('User unfollowed successfully');

        // Verify follow relationship is removed from database
        const follow = await testPrisma.follows.findFirst({
          where: {
            followerId: user2.id,
            followingId: user1.id
          }
        });
        expect(follow).toBeNull();
      });

      it('should return error when trying to unfollow user not being followed', async () => {
        const token = generateTestToken(user2);

        const response = await app.inject({
          method: 'DELETE',
          url: `/social/follow/${user3.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Not following');
      });

      it('should return error without authentication', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: `/social/follow/${user1.id}`
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });
    });

    describe('GET /social/follow/check/:userId', () => {
      it('should return true when following user', async () => {
        const token = generateTestToken(user2);

        // Follow the user first
        await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const response = await app.inject({
          method: 'GET',
          url: `/social/follow/check/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.following).toBe(true);
      });

      it('should return false when not following user', async () => {
        const token = generateTestToken(user2);

        const response = await app.inject({
          method: 'GET',
          url: `/social/follow/check/${user3.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.following).toBe(false);
      });

      it('should return error without authentication', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/social/follow/check/${user1.id}`
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });
    });

    describe('GET /social/followers/:userId', () => {
      it('should return list of followers', async () => {
        const token = generateTestToken(user2);

        // Have user2 follow user1
        await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const response = await app.inject({
          method: 'GET',
          url: `/social/followers/${user1.id}`
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.followers).toBeInstanceOf(Array);
        expect(body.followers.length).toBe(1);
        expect(body.followers[0].id).toBe(user2.id);
      });

      it('should return empty array for user with no followers', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/social/followers/${user3.id}`
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.followers).toEqual([]);
      });
    });

    describe('GET /social/following/:userId', () => {
      it('should return list of users being followed', async () => {
        const token = generateTestToken(user2);

        // Have user2 follow user1 and user3
        await app.inject({
          method: 'POST',
          url: `/social/follow/${user1.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        await app.inject({
          method: 'POST',
          url: `/social/follow/${user3.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const response = await app.inject({
          method: 'GET',
          url: `/social/following/${user2.id}`
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.following).toBeInstanceOf(Array);
        expect(body.following.length).toBe(2);
        expect(body.following.map(f => f.id)).toContain(user1.id);
        expect(body.following.map(f => f.id)).toContain(user3.id);
      });

      it('should return empty array for user following no one', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/social/following/${user3.id}`
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.following).toEqual([]);
      });
    });
  });

  describe('Like System', () => {
    describe('POST /social/like/:reviewId', () => {
      it('should like a review successfully', async () => {
        const token = generateTestToken(user2);

        const response = await app.inject({
          method: 'POST',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toContain('Review liked');

        // Verify like relationship in database
        const like = await testPrisma.like.findFirst({
          where: {
            userId: user2.id,
            reviewId: testReview.id
          }
        });
        expect(like).toBeDefined();
      });

      it('should return error when trying to like non-existent review', async () => {
        const token = generateTestToken(user1);
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await app.inject({
          method: 'POST',
          url: `/social/like/${fakeId}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Review not found');
      });

      it('should return error when already liked review', async () => {
        const token = generateTestToken(user2);

        // First like
        await app.inject({
          method: 'POST',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Try to like again
        const response = await app.inject({
          method: 'POST',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Already liked');
      });

      it('should return error without authentication', async () => {
        const response = await app.inject({
          method: 'POST',
          url: `/social/like/${testReview.id}`
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });
    });

    describe('DELETE /social/like/:reviewId', () => {
      it('should unlike a review successfully', async () => {
        const token = generateTestToken(user2);

        // First like the review
        await app.inject({
          method: 'POST',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Then unlike
        const response = await app.inject({
          method: 'DELETE',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toContain('Review unliked');

        // Verify like relationship is removed from database
        const like = await testPrisma.like.findFirst({
          where: {
            userId: user2.id,
            reviewId: testReview.id
          }
        });
        expect(like).toBeNull();
      });

      it('should return error when trying to unlike review not liked', async () => {
        const token = generateTestToken(user2);

        const response = await app.inject({
          method: 'DELETE',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Not liked');
      });

      it('should return error without authentication', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: `/social/like/${testReview.id}`
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });
    });

    describe('GET /social/like/check/:reviewId', () => {
      it('should return true when review is liked', async () => {
        const token = generateTestToken(user2);

        // Like the review first
        await app.inject({
          method: 'POST',
          url: `/social/like/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const response = await app.inject({
          method: 'GET',
          url: `/social/like/check/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.liked).toBe(true);
      });

      it('should return false when review is not liked', async () => {
        const token = generateTestToken(user2);

        const response = await app.inject({
          method: 'GET',
          url: `/social/like/check/${testReview.id}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.liked).toBe(false);
      });

      it('should return error without authentication', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/social/like/check/${testReview.id}`
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });
    });
  });

  describe('Comment System', () => {
    describe('POST /social/comment', () => {
      it('should create comment successfully', async () => {
        const token = generateTestToken(user2);
        const commentData = {
          reviewId: testReview.id,
          content: 'Great review!'
        };

        const response = await app.inject({
          method: 'POST',
          url: '/social/comment',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          payload: commentData
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.comment.content).toBe(commentData.content);
        expect(body.comment.userId).toBe(user2.id);
        expect(body.comment.reviewId).toBe(testReview.id);
      });

      it('should return error for non-existent review', async () => {
        const token = generateTestToken(user2);
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const commentData = {
          reviewId: fakeId,
          content: 'Great review!'
        };

        const response = await app.inject({
          method: 'POST',
          url: '/social/comment',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          payload: commentData
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Review not found');
      });

      it('should return error for empty comment', async () => {
        const token = generateTestToken(user2);
        const commentData = {
          reviewId: testReview.id,
          content: ''
        };

        const response = await app.inject({
          method: 'POST',
          url: '/social/comment',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          payload: commentData
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Comment content is required');
      });

      it('should return error for comment too long', async () => {
        const token = generateTestToken(user2);
        const commentData = {
          reviewId: testReview.id,
          content: 'a'.repeat(1001) // Exceeds 1000 character limit
        };

        const response = await app.inject({
          method: 'POST',
          url: '/social/comment',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          payload: commentData
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Comment too long');
      });

      it('should return error without authentication', async () => {
        const commentData = {
          reviewId: testReview.id,
          content: 'Great review!'
        };

        const response = await app.inject({
          method: 'POST',
          url: '/social/comment',
          payload: commentData
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      });

      it('should return error for missing required fields', async () => {
        const token = generateTestToken(user2);
        const commentData = {
          content: 'Great review!' // Missing reviewId
        };

        const response = await app.inject({
          method: 'POST',
          url: '/social/comment',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          payload: commentData
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Review ID is required');
      });
    });

    describe('GET /social/comments/:reviewId', () => {
      it('should return comments for a review', async () => {
        const token = generateTestToken(user2);

        // Create a comment first
        await app.inject({
          method: 'POST',
          url: '/social/comment',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          payload: {
            reviewId: testReview.id,
            content: 'Great review!'
          }
        });

        const response = await app.inject({
          method: 'GET',
          url: `/social/comments/${testReview.id}`
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.comments).toBeInstanceOf(Array);
        expect(body.comments.length).toBe(1);
        expect(body.comments[0].content).toBe('Great review!');
        expect(body.comments[0].userId).toBe(user2.id);
      });

      it('should return empty array for review with no comments', async () => {
        // Create a new review without comments
        const newReview = await createTestReview({
          user: user3,
          beverage: testBeverage,
          content: 'Another test review'
        });

        const response = await app.inject({
          method: 'GET',
          url: `/social/comments/${newReview.id}`
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.comments).toEqual([]);
      });

      it('should return error for non-existent review', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';

        const response = await app.inject({
          method: 'GET',
          url: `/social/comments/${fakeId}`
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.message).toContain('Review not found');
      });
    });
  });

  describe('Social Data Integrity', () => {
    it('should prevent duplicate follows', async () => {
      const token = generateTestToken(user2);

      // First follow
      await app.inject({
        method: 'POST',
        url: `/social/follow/${user1.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Try to create duplicate
      const response = await app.inject({
        method: 'POST',
        url: `/social/follow/${user1.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Already following');

             // Verify only one follow relationship exists
       const follows = await testPrisma.follows.findMany({
         where: {
           followerId: user2.id,
           followingId: user1.id
         }
       });
       expect(follows.length).toBe(1);
    });

    it('should prevent duplicate likes', async () => {
      const token = generateTestToken(user2);

      // First like
      await app.inject({
        method: 'POST',
        url: `/social/like/${testReview.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Try to create duplicate
      const response = await app.inject({
        method: 'POST',
        url: `/social/like/${testReview.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Already liked');

      // Verify only one like relationship exists
      const likes = await testPrisma.like.findMany({
        where: {
          userId: user2.id,
          reviewId: testReview.id
        }
      });
      expect(likes.length).toBe(1);
    });

    it('should cascade delete social relationships when user is deleted', async () => {
      const token = generateTestToken(user2);

      // Create follow relationship
      await app.inject({
        method: 'POST',
        url: `/social/follow/${user1.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Create like relationship
      await app.inject({
        method: 'POST',
        url: `/social/like/${testReview.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Delete user2
      await testPrisma.user.delete({
        where: { id: user2.id }
      });

             // Verify relationships are deleted
       const follows = await testPrisma.follows.findMany({
         where: { followerId: user2.id }
       });
       expect(follows.length).toBe(0);

      const likes = await testPrisma.like.findMany({
        where: { userId: user2.id }
      });
      expect(likes.length).toBe(0);
    });

    it('should cascade delete social relationships when review is deleted', async () => {
      const token = generateTestToken(user2);

      // Create like relationship
      await app.inject({
        method: 'POST',
        url: `/social/like/${testReview.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Create comment
      await app.inject({
        method: 'POST',
        url: '/social/comment',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        payload: {
          reviewId: testReview.id,
          content: 'Test comment'
        }
      });

      // Delete review
      await testPrisma.review.delete({
        where: { id: testReview.id }
      });

      // Verify relationships are deleted
      const likes = await testPrisma.like.findMany({
        where: { reviewId: testReview.id }
      });
      expect(likes.length).toBe(0);

      const comments = await testPrisma.comment.findMany({
        where: { reviewId: testReview.id }
      });
      expect(comments.length).toBe(0);
    });
  });
});