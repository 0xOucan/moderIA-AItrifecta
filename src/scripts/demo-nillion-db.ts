/**
 * Nillion DB Demo Script
 * 
 * This script demonstrates and tests all the Nillion DB functionality
 * for the Moderia AI agent. It performs a complete workflow from schema
 * creation to service listing, booking, and review.
 */

import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { NillionDBActionProvider } from '../action-providers/nillion-db/nillionDBActionProvider';
import { createTestLogger } from '../utils/testLogger';
import { printUuidReport, generateAllSchemaUuids } from '../utils/uuidGenerator';

// Load environment variables
dotenv.config();

// Create a test logger
const logger = createTestLogger('nillion-db-demo');

/**
 * Main demo function
 */
async function runDemo() {
  logger.section('Initializing Demo');
  logger.log('Initializing Nillion DB demo script');
  
  // Generate UUIDs for schemas if needed
  logger.section('Schema UUIDs');
  printUuidReport();
  
  // Create Nillion DB action provider
  logger.section('Action Provider Initialization');
  try {
    const nillionDB = new NillionDBActionProvider();
    logger.success('Initialized NillionDBActionProvider successfully');
    
    // Create schemas
    logger.section('Schema Creation');
    
    logger.log('Creating service schema...');
    const serviceSchemaResult = await nillionDB.createServiceSchema();
    logger.log(serviceSchemaResult);
    
    logger.log('Creating booking schema...');
    const bookingSchemaResult = await nillionDB.createBookingSchema();
    logger.log(bookingSchemaResult);
    
    logger.log('Creating review schema...');
    const reviewSchemaResult = await nillionDB.createReviewSchema();
    logger.log(reviewSchemaResult);
    
    // Create mock data
    logger.section('Creating Test Data');
    
    // Generate mock IDs
    const providerId = uuidv4();
    const clientId = uuidv4();
    
    // Create service
    logger.log('Creating a test service...');
    const createServiceResult = await nillionDB.createService({
      providerId: providerId,
      providerName: 'Demo Provider',
      serviceType: 'language_class',
      title: 'Spanish Language Class',
      description: 'Learn Spanish with a native speaker',
      price: 50,
      currency: 'USD',
      durationMinutes: 60,
      date: '2023-12-31',
      time: '15:00',
      timezone: 'America/Mexico_City',
      meetingLink: 'https://meet.example.com/spanish-class',
      tags: ['spanish', 'beginner', 'language']
    });
    logger.success(createServiceResult);
    
    // Ensure serviceId is a string
    const serviceId = createServiceResult.serviceId || uuidv4();
    
    // Create booking
    logger.log('Creating a test booking...');
    const createBookingResult = await nillionDB.createBooking({
      serviceId: serviceId,
      clientId: clientId,
      providerId: providerId,
      bookingDate: '2023-12-31',
      paymentAmount: 50,
      paymentCurrency: 'USD',
      meetingLink: 'https://meet.example.com/spanish-class-booking',
      notes: 'I would like to focus on conversation basics.'
    });
    logger.success(createBookingResult);
    
    // Ensure bookingId is a string
    const bookingId = createBookingResult.bookingId || uuidv4();
    
    // Create review
    logger.log('Creating a test review...');
    const createReviewResult = await nillionDB.createReview({
      bookingId: bookingId,
      serviceId: serviceId,
      clientId: clientId,
      providerId: providerId,
      rating: 5,
      comment: 'Excellent class! The teacher was very patient and helpful.',
      disputed: false
    });
    logger.success(createReviewResult);
    
    // Query data
    logger.section('Querying Data');
    
    // Get available services
    logger.log('Getting available services...');
    const getServicesResult = await nillionDB.getAvailableServices({});
    logger.log(getServicesResult);
    
    // Get client bookings
    logger.log('Getting client bookings...');
    const getClientBookingsResult = await nillionDB.getClientBookings({
      clientId: clientId
    });
    logger.log(getClientBookingsResult);
    
    // Get provider bookings
    logger.log('Getting provider bookings...');
    const getProviderBookingsResult = await nillionDB.getProviderBookings({
      providerId: providerId
    });
    logger.log(getProviderBookingsResult);
    
    // Update booking status
    logger.section('Updating Booking Status');
    logger.log('Updating booking status to completed...');
    const updateBookingResult = await nillionDB.updateBookingStatus({
      bookingId: bookingId,
      status: 'completed',
      agentNotes: 'The class was completed successfully.'
    });
    logger.log(updateBookingResult);
    
    // Create a disputed review for testing dispute resolution
    logger.section('Testing Dispute Resolution');
    
    // Create another booking and review with a dispute
    logger.log('Creating a disputed review for testing...');
    const disputedServiceId = uuidv4();
    
    const createDisputedBookingResult = await nillionDB.createBooking({
      serviceId: disputedServiceId,
      clientId: clientId,
      providerId: providerId,
      bookingDate: '2023-12-30',
      paymentAmount: 75,
      paymentCurrency: 'USD',
      meetingLink: 'https://meet.example.com/disputed-class',
      notes: 'Advanced lesson'
    });
    logger.log(createDisputedBookingResult);
    
    const disputedBookingId = createDisputedBookingResult.bookingId;
    
    // Create disputed review
    const createDisputedReviewResult = await nillionDB.createReview({
      bookingId: disputedBookingId,
      serviceId: disputedServiceId,
      clientId: clientId,
      providerId: providerId,
      rating: 2,
      comment: 'The class was too advanced for me despite requesting a beginner level.',
      disputed: true,
      disputeReason: 'The client requested a beginner class but was enrolled in an advanced class.'
    });
    logger.log(createDisputedReviewResult);
    
    // Ensure reviewId is a string
    const disputedReviewId = createDisputedReviewResult.reviewId || uuidv4();
    
    // Resolve dispute
    logger.log('Resolving dispute...');
    const resolveDisputeResult = await nillionDB.resolveDispute({
      reviewId: disputedReviewId,
      resolution: 'After reviewing the case, the client should receive a 50% refund and the provider should offer a free beginner class.'
    });
    logger.log(resolveDisputeResult);
    
    // Execute a predefined query
    logger.section('Advanced Queries');
    logger.log('Executing a predefined query...');
    try {
      const executeQueryResult = await nillionDB.executeQuery({
        queryId: 'find_disputed_reviews',
        variables: {}
      });
      logger.log(executeQueryResult);
    } catch (error) {
      logger.error('Query execution may not be fully implemented in the demo environment');
      logger.error(error);
    }
    
    logger.section('Demo Completed');
    logger.success('Nillion DB demo completed successfully');
    
  } catch (error) {
    logger.error('Error during demo:');
    logger.error(error);
  } finally {
    logger.close();
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(error => {
    console.error('Unhandled error in demo:', error);
    process.exit(1);
  });
} 