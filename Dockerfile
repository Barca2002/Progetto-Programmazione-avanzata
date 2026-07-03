# Immagine base di Node
FROM node:22-alpine

# ######### DEV ############
# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# #Se non ce lo metto, il container viene eseguito come root, quindi è una buona pratica creare un utente non privilegiato per eseguire l'applicazione.
# USER node 

# # Porta dell'applicazione
# EXPOSE 3000

# # Comando da eseguire all'avvio del container, in questo caso avvia l'applicazione.
# CMD ["npm", "run", "dev"]


##### PROD #######

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia il contenuto della root del progetto nella directory di lavoro del container, cioè /app
COPY . .

# Installa le dipendenze definite nel package.json
RUN npm install

# Compila il progetto TypeScript
RUN npm run build 

# Porta esposta dell'applicazione
EXPOSE 3000

# Comando da eseguire all'avvio del container, in questo caso avvia l'applicazione.
CMD ["npm", "start"]