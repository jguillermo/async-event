FROM amazonlinux:2

ARG SLS_KEY
ARG SLS_SECRET

WORKDIR /application

RUN yum -y install make gcc*
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum -y install nodejs
RUN npm install -g serverless

RUN sls config credentials --provider aws --key $SLS_KEY --secret $SLS_SECRET
EXPOSE 3000
