declare -x OVPN_AUTH=
declare -x OVPN_CIPHER=
declare -x OVPN_CLIENT_TO_CLIENT=
declare -x OVPN_CN=localhost
declare -x OVPN_COMP_LZO=0
declare -x OVPN_DEFROUTE=0
declare -x OVPN_DEVICE=tun
declare -x OVPN_DEVICEN=0
declare -x OVPN_DISABLE_PUSH_BLOCK_DNS=1
declare -x OVPN_DNS=1
declare -x OVPN_DNS_SERVERS=([0]="192.168.13.6")
declare -x OVPN_ENV=/etc/openvpn/ovpn_env.sh
declare -x OVPN_EXTRA_CLIENT_CONFIG=()
declare -x OVPN_EXTRA_SERVER_CONFIG=()
declare -x OVPN_FRAGMENT=
declare -x OVPN_KEEPALIVE='10 60'
declare -x OVPN_MTU=
declare -x OVPN_NAT=1
declare -x OVPN_PORT=1194
declare -x OVPN_PROTO=udp
declare -x OVPN_PUSH=([0]="dhcp-option DOMAIN localhost" [1]="route 192.168.13.0 255.255.255.0" [2]="route 172.17.0.0 255.255.0.0")
declare -x OVPN_ROUTES=()
declare -x OVPN_SERVER=192.168.255.0/24
declare -x OVPN_SERVER_URL=udp://localhost
declare -x OVPN_TLS_CIPHER=
