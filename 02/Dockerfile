FROM nginx:alpine

COPY ./app /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
