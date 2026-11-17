FROM alpine:3.19

RUN apk add --no-cache bash sudo findutils coreutils shadow

# Create challenge user 'analyst'
RUN useradd -m -s /bin/bash analyst && \
    echo "analyst:analyst123" | chpasswd

# Setup flag in protected location
RUN mkdir -p /opt/cybervault && \
    echo "CV{the_final_breach}" > /opt/cybervault/final_flag.txt && \
    chmod 600 /opt/cybervault/final_flag.txt && \
    chown root:root /opt/cybervault/final_flag.txt

# Configure controlled local privilege vulnerability (sudo find without password)
RUN echo "analyst ALL=(ALL) NOPASSWD: /usr/bin/find" >> /etc/sudoers

USER analyst
WORKDIR /home/analyst

CMD ["tail", "-f", "/dev/null"]
