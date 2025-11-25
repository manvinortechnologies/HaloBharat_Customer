import apiClient from './axiosInstance';
import endpoints from './endpoints';

export const getFaqs = async () => {
  const response = await apiClient.get(endpoints.support.faqs());
  return response.data;
};

export const getSupportTickets = async () => {
  const response = await apiClient.get(endpoints.support.tickets());
  return response.data;
};

export const getSupportTicketById = async (ticketId: string | number) => {
  const response = await apiClient.get(endpoints.support.ticketById(ticketId));
  return response.data;
};

export const sendTicketMessage = async (
  ticketId: string | number,
  messageData: { message: string },
) => {
  const response = await apiClient.post(
    endpoints.support.sendMessage(ticketId),
    messageData,
  );
  return response.data;
};

export const createSupportTicket = async (ticketData: { subject: string }) => {
  const response = await apiClient.post(
    endpoints.support.createTicket(),
    ticketData,
  );
  return response.data;
};
