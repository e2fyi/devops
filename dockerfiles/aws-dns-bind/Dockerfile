FROM alpine:3.8
LABEL maintainer=eterna2@hotmail.com

EXPOSE 53


RUN apk update && apk add  bind bind-tools bind-libs bind-doc curl \
    && mkdir /var/cache/bind \
	&& chown named /var/cache/bind \
	&& mkdir  /var/lib/bind \
	&& chown -R named /var/lib/bind \
	&& alias rndc="rndc -c /etc/named/rndc.conf" >> ~/.bashrc


COPY named.conf.options.template /etc/named/
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && chown named /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh" ]
