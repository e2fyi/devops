#!/bin/sh
set -euo pipefail

MAC="$(curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs/)"
VPCCIDR="$(curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs/"$MAC"/vpc-ipv4-cidr-block)"
VPCNET="${VPCCIDR%%/*}"
VPCBASE="$(echo "$VPCNET" | cut -d"." -f1-3)"
VPCDNS="$VPCBASE"'.2'

echo "forwarding to AWS DNS@$VPCDNS"

sed s/DNSIP/"$VPCDNS"/ /etc/named/named.conf.options.template \
  > /etc/named/named.conf

named -u named -4 -g -c /etc/named/named.conf