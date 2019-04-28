ARG IMAGE
FROM $IMAGE

ARG SLS_KEY
ARG SLS_SECRET
ARG STAGE
ARG PROJECT_NAME

COPY . .
#RUN npm i --production
RUN npm install

RUN echo 'Deploying --------'

RUN sls deploy -v -s $STAGE
