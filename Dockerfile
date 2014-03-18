FROM debian:wheezy
MAINTAINER ahdinosaur "dinosaur@riseup.net"

# update list of packages
RUN aptitude update

# install openjdk 7
RUN aptitude install -y openjdk-7-jdk

# increase file limit
RUN echo "root soft nofile 40000" >> /etc/security/limits.conf
RUN echo "root hard nofile 40000" >> /etc/security/limits.conf

# edit pam settings
RUN echo "session required pam_limits.so" >> /etc/pam.d/su

# set environment variables
ENV JAVA_HOME /usr/lib/jvm/java-7-openjdk-amd64/
ENV PATH $JAVA_HOME/bin:$PATH
