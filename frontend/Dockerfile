FROM nginx:alpine

# Copy the static web files
COPY public /usr/share/nginx/html

# Expose port (handled by compose but good practice)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
