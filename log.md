2026-02-06T03:08:07.312049585Z [inf]  
2026-02-06T03:08:09.343179101Z [inf]  [35m[Region: europe-west4][0m
2026-02-06T03:08:09.349362310Z [inf]  [35m==============
2026-02-06T03:08:09.349388262Z [inf]  Using Nixpacks
2026-02-06T03:08:09.349395285Z [inf]  ==============
2026-02-06T03:08:09.349399786Z [inf]  [0m
2026-02-06T03:08:09.349488333Z [inf]  context: qrw7-ytOs
2026-02-06T03:08:09.437432703Z [inf]  ╔════════ Nixpacks v1.38.0 ═══════╗
2026-02-06T03:08:09.437470265Z [inf]  ║ setup      │ nodejs_18, npm-9_x ║
2026-02-06T03:08:09.437476508Z [inf]  ║─────────────────────────────────║
2026-02-06T03:08:09.437483031Z [inf]  ║ install    │ npm ci             ║
2026-02-06T03:08:09.437489683Z [inf]  ║─────────────────────────────────║
2026-02-06T03:08:09.437496177Z [inf]  ║ build      │ npm install        ║
2026-02-06T03:08:09.437500992Z [inf]  ║─────────────────────────────────║
2026-02-06T03:08:09.437506349Z [inf]  ║ start      │ npm start          ║
2026-02-06T03:08:09.437511591Z [inf]  ╚═════════════════════════════════╝
2026-02-06T03:08:09.655672199Z [inf]  [internal] load build definition from Dockerfile
2026-02-06T03:08:09.655732367Z [inf]  [internal] load build definition from Dockerfile
2026-02-06T03:08:09.655814958Z [inf]  [internal] load build definition from Dockerfile
2026-02-06T03:08:09.666443858Z [inf]  [internal] load build definition from Dockerfile
2026-02-06T03:08:09.668594019Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2026-02-06T03:08:10.062699744Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2026-02-06T03:08:10.062963813Z [inf]  [internal] load .dockerignore
2026-02-06T03:08:10.062996847Z [inf]  [internal] load .dockerignore
2026-02-06T03:08:10.063924230Z [inf]  [internal] load .dockerignore
2026-02-06T03:08:10.073461770Z [inf]  [internal] load .dockerignore
2026-02-06T03:08:10.078800929Z [inf]  [stage-0 10/10] COPY . /app
2026-02-06T03:08:10.078835949Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2026-02-06T03:08:10.078850696Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-node_modules/cache,target=/app/node_modules/.cache npm install
2026-02-06T03:08:10.078866326Z [inf]  [stage-0  7/10] COPY . /app/.
2026-02-06T03:08:10.078877020Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm ci
2026-02-06T03:08:10.078890732Z [inf]  [stage-0  5/10] COPY . /app/.
2026-02-06T03:08:10.078902135Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2026-02-06T03:08:10.078915053Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2026-02-06T03:08:10.078926295Z [inf]  [internal] load build context
2026-02-06T03:08:10.078939146Z [inf]  [stage-0  2/10] WORKDIR /app/
2026-02-06T03:08:10.078952028Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-06T03:08:10.078975283Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-06T03:08:10.078994598Z [inf]  [internal] load build context
2026-02-06T03:08:10.079350539Z [inf]  [internal] load build context
2026-02-06T03:08:10.128711805Z [inf]  [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-02-06T03:08:10.140599349Z [inf]  [internal] load build context
2026-02-06T03:08:10.142012308Z [inf]  [stage-0  2/10] WORKDIR /app/
2026-02-06T03:08:10.142054184Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2026-02-06T03:08:10.261683320Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
2026-02-06T03:08:10.269198737Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2026-02-06T03:08:10.499611001Z [inf]  unpacking 'https://github.com/NixOS/nixpkgs/archive/ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.tar.gz' into the Git cache...

2026-02-06T03:08:41.00117631Z [inf]  unpacking 'https://github.com/railwayapp/nix-npm-overlay/archive/main.tar.gz' into the Git cache...

2026-02-06T03:08:41.705138802Z [inf]  installing 'ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env'

2026-02-06T03:08:42.557070625Z [inf]  these 5 derivations will be built:

2026-02-06T03:08:42.557085906Z [inf]    /nix/store/1f4a312hz9m6y1ssip52drgkim8az4d6-libraries.drv
  /nix/store/79g4v87v1cgrx5vlwzcagcs6v8ps8fk2-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv
  /nix/store/6vy68gykpxfphbmmyd59ya88xvrwvvaa-npm-9.9.4.tgz.drv
  /nix/store/w9h0z1lhfwxc0m38f3w5brfdqrzm4wyj-npm.drv
  /nix/store/69jikgj7ilzvyagynzacn8fxpp6wffww-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv
these 75 paths will be fetched (116.25 MiB download, 554.76 MiB unpacked):

2026-02-06T03:08:42.557151806Z [inf]    /nix/store/cf7gkacyxmm66lwl5nj6j6yykbrg4q5c-acl-2.3.2
  /nix/store/a9jgnlhkjkxav6qrc3rzg2q84pkl2wvr-attr-2.5.2
  /nix/store/5mh7kaj2fyv8mk4sfq1brwxgc02884wi-bash-5.2p37
  /nix/store/j7p46r8v9gcpbxx89pbqlh61zhd33gzv-binutils-2.43.1
  /nix/store/df2a8k58k00f2dh2x930dg6xs6g6mliv-binutils-2.43.1-lib
  /nix/store/srcmmqi8kxjfygd0hyy42c8hv6cws83b-binutils-wrapper-2.43.1
  /nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl
  /nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8
  /nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin
  /nix/store/4s9rah4cwaxflicsk5cndnknqlk9n4p3-coreutils-9.5
  /nix/store/pkc7mb4a4qvyz73srkqh4mwl70w98dsv-curl-8.11.0
  /nix/store/p123cq20klajcl9hj8jnkjip5nw6awhz-curl-8.11.0-bin
  /nix/store/5f5linrxzhhb3mrclkwdpm9bd8ygldna-curl-8.11.0-dev
  /nix/store/agvks3qmzja0yj54szi3vja6vx3cwkkw-curl-8.11.0-man

2026-02-06T03:08:42.557164435Z [inf]    /nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10
  /nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2
  /nix/store/qbry6090vlr9ar33kdmmbq2p5apzbga8-expand-response-params
  /nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46
  /nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0
  /nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1
  /nix/store/l89iqc7am6i60y8vk507zwrzxf0wcd3v-gcc-14-20241116
  /nix/store/bpq1s72cw9qb2fs8mnmlw6hn2c7iy0ss-gcc-14-20241116-lib
  /nix/store/17v0ywnr3akp85pvdi56gwl99ljv95kx-gcc-14-20241116-libgcc

2026-02-06T03:08:42.557169494Z [inf]    /nix/store/xcn9p4xxfbvlkpah7pwchpav4ab9d135-gcc-wrapper-14-20241116

2026-02-06T03:08:42.557175551Z [inf]    /nix/store/65h17wjrrlsj2rj540igylrx7fqcd6vq-glibc-2.40-36
  /nix/store/1c6bmxrrhm8bd26ai2rjqld2yyjrxhds-glibc-2.40-36-bin
  /nix/store/kj8hbqx4ds9qm9mq7hyikxyfwwg13kzj-glibc-2.40-36-dev

2026-02-06T03:08:42.557180217Z [inf]    /nix/store/kryrg7ds05iwcmy81amavk8w13y4lxbs-gmp-6.3.0

2026-02-06T03:08:42.557184241Z [inf]    /nix/store/a2byxfv4lc8f2g5xfzw8cz5q8k05wi29-gmp-with-cxx-6.3.0
  /nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01
  /nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11

2026-02-06T03:08:42.557259301Z [inf]    /nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1
  /nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9
  /nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35
  /nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13
  /nix/store/wwipgdqb4p2fr46kmw9c5wlk799kbl68-icu4c-74.2
  /nix/store/m8w3mf0i4862q22bxad0wspkgdy4jnkk-icu4c-74.2-dev
  /nix/store/xmbv8s4p4i4dbxgkgdrdfb0ym25wh6gk-isl-0.20
  /nix/store/2wh1gqyzf5xsvxpdz2k0bxiz583wwq29-keyutils-1.6.3-lib
  /nix/store/milph81dilrh96isyivh5n50agpx39k2-krb5-1.21.3
  /nix/store/b56mswksrql15knpb1bnhv3ysif340kd-krb5-1.21.3-dev
  /nix/store/v9c1s50x7magpiqgycxxkn36avzbcg0g-krb5-1.21.3-lib
  /nix/store/34z2792zyd4ayl5186vx0s98ckdaccz9-libidn2-2.3.7
  /nix/store/2a3anh8vl3fcgk0fvaravlimrqawawza-libmpc-1.3.1
  /nix/store/8675pnfr4fqnwv4pzjl67hdwls4q13aa-libssh2-1.11.1
  /nix/store/d7zhcrcc7q3yfbm3qkqpgc3daq82spwi-libssh2-1.11.1-dev
  /nix/store/xcqcgqazykf6s7fsn08k0blnh0wisdcl-libunistring-1.3
  /nix/store/r9ac2hwnmb0nxwsrvr6gi9wsqf2whfqj-libuv-1.49.2
  /nix/store/ll14czvpxglf6nnwmmrmygplm830fvlv-libuv-1.49.2-dev
  /nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36
  /nix/store/pc74azbkr19rkd5bjalq2xwx86cj3cga-linux-headers-6.12
  /nix/store/fv7gpnvg922frkh81w5hkdhpz0nw3iiz-mirrors-list
  /nix/store/qs22aazzrdd4dnjf9vffl0n31hvls43h-mpfr-4.2.1
  /nix/store/grixvx878884hy8x3xs0c0s1i00j632k-nghttp2-1.64.0
  /nix/store/dz97fw51rm5bl9kz1vg0haj1j1a7r1mr-nghttp2-1.64.0-dev
  /nix/store/qcghigzrz56vczwlzg9c02vbs6zr9jkz-nghttp2-1.64.0-lib
  /nix/store/wlpq101dsifq98z2bk300x4dk80wcybr-nodejs-18.20.5
  /nix/store/9l9n7a0v4aibcz0sgd0crs209an9p7dz-openssl-3.3.2
  /nix/store/h1ydpxkw9qhjdxjpic1pdc2nirggyy6f-openssl-3.3.2

2026-02-06T03:08:42.557263783Z [inf]    /nix/store/lygl27c44xv73kx1spskcgvzwq7z337c-openssl-3.3.2-bin
  /nix/store/qq5q0alyzywdazhmybi7m69akz0ppk05-openssl-3.3.2-bin
  /nix/store/kqm7wpqkzc4bwjlzqizcbz0mgkj06a9x-openssl-3.3.2-dev
  /nix/store/pp2zf8bdgyz60ds8vcshk2603gcjgp72-openssl-3.3.2-dev

2026-02-06T03:08:42.557266996Z [inf]    /nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6

2026-02-06T03:08:42.557272056Z [inf]    /nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0

2026-02-06T03:08:42.557275284Z [inf]    /nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44
  /nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0
  /nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux

2026-02-06T03:08:42.557284173Z [inf]    /nix/store/d0gfdcag8bxzvg7ww4s7px4lf8sxisyx-stdenv-linux

2026-02-06T03:08:42.557287376Z [inf]    /nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook

2026-02-06T03:08:42.557318471Z [inf]    /nix/store/acfkqzj5qrqs88a4a6ixnybbjxja663d-xgcc-14-20241116-libgcc
  /nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3
  /nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin

2026-02-06T03:08:42.557324915Z [inf]    /nix/store/cqlaa2xf6lslnizyj9xqa8j0ii1yqw0x-zlib-1.3.1
  /nix/store/1lggwqzapn5mn49l9zy4h566ysv9kzdb-zlib-1.3.1-dev

2026-02-06T03:08:42.564223048Z [inf]  copying path '/nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.568230593Z [inf]  copying path '/nix/store/17v0ywnr3akp85pvdi56gwl99ljv95kx-gcc-14-20241116-libgcc' from 'https://cache.nixos.org'...
copying path '/nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.569170172Z [inf]  copying path '/nix/store/acfkqzj5qrqs88a4a6ixnybbjxja663d-xgcc-14-20241116-libgcc' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.569411919Z [inf]  copying path '/nix/store/xcqcgqazykf6s7fsn08k0blnh0wisdcl-libunistring-1.3' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.572482535Z [inf]  copying path '/nix/store/pc74azbkr19rkd5bjalq2xwx86cj3cga-linux-headers-6.12' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.572492158Z [inf]  copying path '/nix/store/fv7gpnvg922frkh81w5hkdhpz0nw3iiz-mirrors-list' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.572906113Z [inf]  copying path '/nix/store/agvks3qmzja0yj54szi3vja6vx3cwkkw-curl-8.11.0-man' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.573489255Z [inf]  copying path '/nix/store/grixvx878884hy8x3xs0c0s1i00j632k-nghttp2-1.64.0' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.580126184Z [inf]  copying path '/nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.808705272Z [inf]  copying path '/nix/store/34z2792zyd4ayl5186vx0s98ckdaccz9-libidn2-2.3.7' from 'https://cache.nixos.org'...

2026-02-06T03:08:42.826303402Z [inf]  copying path '/nix/store/65h17wjrrlsj2rj540igylrx7fqcd6vq-glibc-2.40-36' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392163511Z [inf]  copying path '/nix/store/a9jgnlhkjkxav6qrc3rzg2q84pkl2wvr-attr-2.5.2' from 'https://cache.nixos.org'...
copying path '/nix/store/5mh7kaj2fyv8mk4sfq1brwxgc02884wi-bash-5.2p37' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.39218548Z [inf]  copying path '/nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8' from 'https://cache.nixos.org'...
copying path '/nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392190876Z [inf]  copying path '/nix/store/qbry6090vlr9ar33kdmmbq2p5apzbga8-expand-response-params' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392269016Z [inf]  copying path '/nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1' from 'https://cache.nixos.org'...
copying path '/nix/store/bpq1s72cw9qb2fs8mnmlw6hn2c7iy0ss-gcc-14-20241116-lib' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392351524Z [inf]  copying path '/nix/store/1c6bmxrrhm8bd26ai2rjqld2yyjrxhds-glibc-2.40-36-bin' from 'https://cache.nixos.org'...
copying path '/nix/store/kryrg7ds05iwcmy81amavk8w13y4lxbs-gmp-6.3.0' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392459527Z [inf]  copying path '/nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1' from 'https://cache.nixos.org'...
copying path '/nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.39257969Z [inf]  copying path '/nix/store/2wh1gqyzf5xsvxpdz2k0bxiz583wwq29-keyutils-1.6.3-lib' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392668017Z [inf]  copying path '/nix/store/r9ac2hwnmb0nxwsrvr6gi9wsqf2whfqj-libuv-1.49.2' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392751348Z [inf]  copying path '/nix/store/9l9n7a0v4aibcz0sgd0crs209an9p7dz-openssl-3.3.2' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.392931546Z [inf]  copying path '/nix/store/qcghigzrz56vczwlzg9c02vbs6zr9jkz-nghttp2-1.64.0-lib' from 'https://cache.nixos.org'...
copying path '/nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.419125273Z [inf]  copying path '/nix/store/h1ydpxkw9qhjdxjpic1pdc2nirggyy6f-openssl-3.3.2' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.422953498Z [inf]  copying path '/nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.425176117Z [inf]  copying path '/nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.425381761Z [inf]  copying path '/nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.426149762Z [inf]  copying path '/nix/store/cf7gkacyxmm66lwl5nj6j6yykbrg4q5c-acl-2.3.2' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.426252096Z [inf]  copying path '/nix/store/cqlaa2xf6lslnizyj9xqa8j0ii1yqw0x-zlib-1.3.1' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.434254736Z [inf]  copying path '/nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.434429259Z [inf]  copying path '/nix/store/dz97fw51rm5bl9kz1vg0haj1j1a7r1mr-nghttp2-1.64.0-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.435392552Z [inf]  copying path '/nix/store/ll14czvpxglf6nnwmmrmygplm830fvlv-libuv-1.49.2-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.443048213Z [inf]  copying path '/nix/store/xmbv8s4p4i4dbxgkgdrdfb0ym25wh6gk-isl-0.20' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.445501974Z [inf]  copying path '/nix/store/qs22aazzrdd4dnjf9vffl0n31hvls43h-mpfr-4.2.1' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.447364794Z [inf]  copying path '/nix/store/df2a8k58k00f2dh2x930dg6xs6g6mliv-binutils-2.43.1-lib' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.447977059Z [inf]  copying path '/nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.450051046Z [inf]  copying path '/nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.451458715Z [inf]  copying path '/nix/store/1lggwqzapn5mn49l9zy4h566ysv9kzdb-zlib-1.3.1-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.460611664Z [inf]  copying path '/nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.469214124Z [inf]  copying path '/nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.478082518Z [inf]  copying path '/nix/store/2a3anh8vl3fcgk0fvaravlimrqawawza-libmpc-1.3.1' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.492080184Z [inf]  copying path '/nix/store/kj8hbqx4ds9qm9mq7hyikxyfwwg13kzj-glibc-2.40-36-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.49209896Z [inf]  copying path '/nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.576651873Z [inf]  copying path '/nix/store/v9c1s50x7magpiqgycxxkn36avzbcg0g-krb5-1.21.3-lib' from 'https://cache.nixos.org'...
copying path '/nix/store/8675pnfr4fqnwv4pzjl67hdwls4q13aa-libssh2-1.11.1' from 'https://cache.nixos.org'...
copying path '/nix/store/qq5q0alyzywdazhmybi7m69akz0ppk05-openssl-3.3.2-bin' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.584494781Z [inf]  copying path '/nix/store/lygl27c44xv73kx1spskcgvzwq7z337c-openssl-3.3.2-bin' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.602019432Z [inf]  copying path '/nix/store/j7p46r8v9gcpbxx89pbqlh61zhd33gzv-binutils-2.43.1' from 'https://cache.nixos.org'...
copying path '/nix/store/l89iqc7am6i60y8vk507zwrzxf0wcd3v-gcc-14-20241116' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.602036278Z [inf]  copying path '/nix/store/a2byxfv4lc8f2g5xfzw8cz5q8k05wi29-gmp-with-cxx-6.3.0' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.602123078Z [inf]  copying path '/nix/store/wwipgdqb4p2fr46kmw9c5wlk799kbl68-icu4c-74.2' from 'https://cache.nixos.org'...
copying path '/nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.612353098Z [inf]  copying path '/nix/store/pp2zf8bdgyz60ds8vcshk2603gcjgp72-openssl-3.3.2-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.615587162Z [inf]  copying path '/nix/store/kqm7wpqkzc4bwjlzqizcbz0mgkj06a9x-openssl-3.3.2-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.645888479Z [inf]  copying path '/nix/store/4s9rah4cwaxflicsk5cndnknqlk9n4p3-coreutils-9.5' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.647516971Z [inf]  copying path '/nix/store/pkc7mb4a4qvyz73srkqh4mwl70w98dsv-curl-8.11.0' from 'https://cache.nixos.org'...
copying path '/nix/store/milph81dilrh96isyivh5n50agpx39k2-krb5-1.21.3' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.6710233Z [inf]  copying path '/nix/store/d7zhcrcc7q3yfbm3qkqpgc3daq82spwi-libssh2-1.11.1-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.675448125Z [inf]  copying path '/nix/store/p123cq20klajcl9hj8jnkjip5nw6awhz-curl-8.11.0-bin' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.682131504Z [inf]  copying path '/nix/store/b56mswksrql15knpb1bnhv3ysif340kd-krb5-1.21.3-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.694692047Z [inf]  copying path '/nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10' from 'https://cache.nixos.org'...
copying path '/nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0' from 'https://cache.nixos.org'...
copying path '/nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.70600982Z [inf]  copying path '/nix/store/5f5linrxzhhb3mrclkwdpm9bd8ygldna-curl-8.11.0-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.738130402Z [inf]  copying path '/nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux' from 'https://cache.nixos.org'...

2026-02-06T03:08:43.771727521Z [inf]  building '/nix/store/1f4a312hz9m6y1ssip52drgkim8az4d6-libraries.drv'...

2026-02-06T03:08:43.791138086Z [inf]  building '/nix/store/6vy68gykpxfphbmmyd59ya88xvrwvvaa-npm-9.9.4.tgz.drv'...

2026-02-06T03:08:43.901668453Z [inf]  building '/nix/store/79g4v87v1cgrx5vlwzcagcs6v8ps8fk2-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv'...

2026-02-06T03:08:43.945820143Z [inf]  
trying https://registry.npmjs.org/npm/-/npm-9.9.4.tgz

2026-02-06T03:08:43.949986545Z [inf]    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current

2026-02-06T03:08:43.950062861Z [inf]                                   Dload  Upload   Total   Spent    Left  Speed

2026-02-06T03:08:44.040477717Z [inf]  100 2648k  100 2648k    0     0  28.5M      0 --:--:-- --:--:-- --:--:-- 28.7M

2026-02-06T03:08:44.130251368Z [inf]  copying path '/nix/store/srcmmqi8kxjfygd0hyy42c8hv6cws83b-binutils-wrapper-2.43.1' from 'https://cache.nixos.org'...

2026-02-06T03:08:44.377878942Z [inf]  copying path '/nix/store/m8w3mf0i4862q22bxad0wspkgdy4jnkk-icu4c-74.2-dev' from 'https://cache.nixos.org'...

2026-02-06T03:08:44.484488447Z [inf]  copying path '/nix/store/wlpq101dsifq98z2bk300x4dk80wcybr-nodejs-18.20.5' from 'https://cache.nixos.org'...

2026-02-06T03:08:47.874183638Z [inf]  copying path '/nix/store/xcn9p4xxfbvlkpah7pwchpav4ab9d135-gcc-wrapper-14-20241116' from 'https://cache.nixos.org'...

2026-02-06T03:08:47.884406256Z [inf]  copying path '/nix/store/d0gfdcag8bxzvg7ww4s7px4lf8sxisyx-stdenv-linux' from 'https://cache.nixos.org'...

2026-02-06T03:08:47.913834308Z [inf]  building '/nix/store/w9h0z1lhfwxc0m38f3w5brfdqrzm4wyj-npm.drv'...

2026-02-06T03:08:47.972109518Z [inf]  Running phase: unpackPhase

2026-02-06T03:08:47.976842988Z [inf]  unpacking source archive /nix/store/fkd1ma3nify8r9wp463yg5rqz9hdcyf1-npm-9.9.4.tgz

2026-02-06T03:08:48.088515855Z [inf]  source root is package

2026-02-06T03:08:48.149839279Z [inf]  setting SOURCE_DATE_EPOCH to timestamp 499162500 of file package/package.json

2026-02-06T03:08:48.155312204Z [inf]  Running phase: installPhase

2026-02-06T03:08:48.816888363Z [inf]  building '/nix/store/69jikgj7ilzvyagynzacn8fxpp6wffww-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env.drv'...

2026-02-06T03:08:48.892241103Z [inf]  created 33 symlinks in user environment

2026-02-06T03:08:49.050427263Z [inf]  building '/nix/store/2s6nns61yczxvy2yaddrzp6952709a4j-user-environment.drv'...

2026-02-06T03:08:49.175008715Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/profile

2026-02-06T03:08:49.175028569Z [inf]  removing profile version 1

2026-02-06T03:08:49.17542952Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/channels

2026-02-06T03:08:49.175639681Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/profile

2026-02-06T03:08:49.175741978Z [inf]  removing old generations of profile /nix/var/nix/profiles/per-user/root/channels

2026-02-06T03:08:49.179121593Z [inf]  finding garbage collector roots...

2026-02-06T03:08:49.179245002Z [inf]  removing stale link from '/nix/var/nix/gcroots/auto/lzjbmb2ry0z7lma2fvpqprb12921pnb5' to '/nix/var/nix/profiles/per-user/root/profile-1-link'

2026-02-06T03:08:49.18409859Z [inf]  deleting garbage...

2026-02-06T03:08:49.187398792Z [inf]  deleting '/nix/store/a9qf4wwhympzs35ncp80r185j6a21w07-user-environment'

2026-02-06T03:08:49.20376038Z [inf]  deleting '/nix/store/253kwn1730vnay87xkjgxa2v97w3y079-user-environment.drv'

2026-02-06T03:08:49.204036191Z [inf]  deleting '/nix/store/hn5mrh362n52x8wwab9s1v6bgn4n5c94-env-manifest.nix'

2026-02-06T03:08:49.204296197Z [inf]  deleting '/nix/store/9fxr7753z31rn59i64dqaajgsx0ap91p-libraries'

2026-02-06T03:08:49.20490524Z [inf]  deleting '/nix/store/5f5linrxzhhb3mrclkwdpm9bd8ygldna-curl-8.11.0-dev'

2026-02-06T03:08:49.205412965Z [inf]  deleting '/nix/store/p123cq20klajcl9hj8jnkjip5nw6awhz-curl-8.11.0-bin'

2026-02-06T03:08:49.205638698Z [inf]  deleting '/nix/store/pkc7mb4a4qvyz73srkqh4mwl70w98dsv-curl-8.11.0'

2026-02-06T03:08:49.205924247Z [inf]  deleting '/nix/store/b56mswksrql15knpb1bnhv3ysif340kd-krb5-1.21.3-dev'

2026-02-06T03:08:49.206887862Z [inf]  deleting '/nix/store/milph81dilrh96isyivh5n50agpx39k2-krb5-1.21.3'

2026-02-06T03:08:49.20779096Z [inf]  deleting '/nix/store/v9c1s50x7magpiqgycxxkn36avzbcg0g-krb5-1.21.3-lib'

2026-02-06T03:08:49.208879881Z [inf]  deleting '/nix/store/dz97fw51rm5bl9kz1vg0haj1j1a7r1mr-nghttp2-1.64.0-dev'

2026-02-06T03:08:49.209113931Z [inf]  deleting '/nix/store/grixvx878884hy8x3xs0c0s1i00j632k-nghttp2-1.64.0'

2026-02-06T03:08:49.209721611Z [inf]  deleting '/nix/store/d0gfdcag8bxzvg7ww4s7px4lf8sxisyx-stdenv-linux'

2026-02-06T03:08:49.210238605Z [inf]  deleting '/nix/store/4ig84cyqi6qy4n0sanrbzsw1ixa497jx-stdenv-linux'

2026-02-06T03:08:49.210485188Z [inf]  deleting '/nix/store/abm77lnrkrkb58z6xp1qwjcr1xgkcfwm-gnused-4.9'

2026-02-06T03:08:49.212863515Z [inf]  deleting '/nix/store/1i003ijlh9i0mzp6alqby5hg3090pjdx-perl-5.40.0'

2026-02-06T03:08:49.234748227Z [inf]  deleting '/nix/store/h18s640fnhhj2qdh5vivcfbxvz377srg-xz-5.6.3-bin'

2026-02-06T03:08:49.235148729Z [inf]  deleting '/nix/store/c2njy6bv84kw1i4bjf5k5gn7gz8hn57n-xz-5.6.3'

2026-02-06T03:08:49.236642322Z [inf]  deleting '/nix/store/fkd1ma3nify8r9wp463yg5rqz9hdcyf1-npm-9.9.4.tgz'

2026-02-06T03:08:49.236770786Z [inf]  deleting '/nix/store/bk363s873cgn87wgl7ag62wi20cry89i-source'

2026-02-06T03:08:49.237796381Z [inf]  deleting '/nix/store/xcn9p4xxfbvlkpah7pwchpav4ab9d135-gcc-wrapper-14-20241116'

2026-02-06T03:08:49.238402156Z [inf]  deleting '/nix/store/srcmmqi8kxjfygd0hyy42c8hv6cws83b-binutils-wrapper-2.43.1'

2026-02-06T03:08:49.239054045Z [inf]  deleting '/nix/store/d7zhcrcc7q3yfbm3qkqpgc3daq82spwi-libssh2-1.11.1-dev'

2026-02-06T03:08:49.239366591Z [inf]  deleting '/nix/store/8675pnfr4fqnwv4pzjl67hdwls4q13aa-libssh2-1.11.1'

2026-02-06T03:08:49.239678399Z [inf]  deleting '/nix/store/aap6cq56amx4mzbyxp2wpgsf1kqjcr1f-gnugrep-3.11'

2026-02-06T03:08:49.242310968Z [inf]  deleting '/nix/store/3j1p598fivxs69wx3a657ysv3rw8k06l-pcre2-10.44'

2026-02-06T03:08:49.242614139Z [inf]  deleting '/nix/store/c4rj90r2m89rxs64hmm857mipwjhig5d-file-5.46'

2026-02-06T03:08:49.243168476Z [inf]  deleting '/nix/store/l89iqc7am6i60y8vk507zwrzxf0wcd3v-gcc-14-20241116'

2026-02-06T03:08:49.260232929Z [inf]  deleting '/nix/store/kj8hbqx4ds9qm9mq7hyikxyfwwg13kzj-glibc-2.40-36-dev'

2026-02-06T03:08:49.265073147Z [inf]  deleting '/nix/store/mglixp03lsp0w986svwdvm7vcy17rdax-bzip2-1.0.8-bin'

2026-02-06T03:08:49.265395352Z [inf]  deleting '/nix/store/ivl2v8rgg7qh1jkj5pwpqycax3rc2hnl-bzip2-1.0.8'

2026-02-06T03:08:49.265626024Z [inf]  deleting '/nix/store/agvks3qmzja0yj54szi3vja6vx3cwkkw-curl-8.11.0-man'

2026-02-06T03:08:49.266041686Z [inf]  deleting '/nix/store/qcghigzrz56vczwlzg9c02vbs6zr9jkz-nghttp2-1.64.0-lib'

2026-02-06T03:08:49.266624894Z [inf]  deleting '/nix/store/2a3anh8vl3fcgk0fvaravlimrqawawza-libmpc-1.3.1'

2026-02-06T03:08:49.267008547Z [inf]  deleting '/nix/store/qs22aazzrdd4dnjf9vffl0n31hvls43h-mpfr-4.2.1'

2026-02-06T03:08:49.267394931Z [inf]  deleting '/nix/store/5yja5dpk2qw1v5mbfbl2d7klcdfrh90w-patch-2.7.6'

2026-02-06T03:08:49.267691083Z [inf]  deleting '/nix/store/74h4z8k82pmp24xryflv4lxkz8jlpqqd-ed-1.20.2'

2026-02-06T03:08:49.268047755Z [inf]  deleting '/nix/store/lwi59jcfwk2lnrakmm1y5vw85hj3n1bi-source'

2026-02-06T03:08:50.341664085Z [inf]  deleting '/nix/store/kqm7wpqkzc4bwjlzqizcbz0mgkj06a9x-openssl-3.3.2-dev'

2026-02-06T03:08:50.344063463Z [inf]  deleting '/nix/store/9cwwj1c9csmc85l2cqzs3h9hbf1vwl6c-gnutar-1.35'

2026-02-06T03:08:50.346626887Z [inf]  deleting '/nix/store/j7p46r8v9gcpbxx89pbqlh61zhd33gzv-binutils-2.43.1'

2026-02-06T03:08:50.350451906Z [inf]  deleting '/nix/store/df2a8k58k00f2dh2x930dg6xs6g6mliv-binutils-2.43.1-lib'

2026-02-06T03:08:50.351386523Z [inf]  deleting '/nix/store/qq5q0alyzywdazhmybi7m69akz0ppk05-openssl-3.3.2-bin'

2026-02-06T03:08:50.351635493Z [inf]  deleting '/nix/store/9l9n7a0v4aibcz0sgd0crs209an9p7dz-openssl-3.3.2'

2026-02-06T03:08:50.352161606Z [inf]  deleting '/nix/store/wf5zj2gbib3gjqllkabxaw4dh0gzcla3-builder.pl'

2026-02-06T03:08:50.352682732Z [inf]  deleting '/nix/store/d29r1bdmlvwmj52apgcdxfl1mm9c5782-update-autotools-gnu-config-scripts-hook'

2026-02-06T03:08:50.35305048Z [inf]  deleting '/nix/store/nvvj6sk0k6px48436drlblf4gafgbvzr-gzip-1.13'

2026-02-06T03:08:50.353550332Z [inf]  deleting '/nix/store/00g69vw7c9lycy63h45ximy0wmzqx5y6-diffutils-3.10'

2026-02-06T03:08:50.355815336Z [inf]  deleting '/nix/store/2wh1gqyzf5xsvxpdz2k0bxiz583wwq29-keyutils-1.6.3-lib'

2026-02-06T03:08:50.356151006Z [inf]  deleting '/nix/store/6cr0spsvymmrp1hj5n0kbaxw55w1lqyp-libxcrypt-4.4.36'

2026-02-06T03:08:50.356580112Z [inf]  deleting '/nix/store/jqrz1vq5nz4lnv9pqzydj0ir58wbjfy1-findutils-4.10.0'

2026-02-06T03:08:50.359002835Z [inf]  deleting '/nix/store/srfxqk119fijwnprgsqvn68ys9kiw0bn-patchelf-0.15.0'

2026-02-06T03:08:50.359646907Z [inf]  deleting '/nix/store/fp6cjl1zcmm6mawsnrb5yak1wkz2ma8l-gnumake-4.4.1'

2026-02-06T03:08:50.361611331Z [inf]  deleting '/nix/store/a3c47r5z1q2c4rz0kvq8hlilkhx2s718-gawk-5.3.1'

2026-02-06T03:08:50.363534886Z [inf]  deleting '/nix/store/fv7gpnvg922frkh81w5hkdhpz0nw3iiz-mirrors-list'

2026-02-06T03:08:50.363657365Z [inf]  deleting '/nix/store/pc74azbkr19rkd5bjalq2xwx86cj3cga-linux-headers-6.12'

2026-02-06T03:08:50.372760459Z [inf]  deleting '/nix/store/xmbv8s4p4i4dbxgkgdrdfb0ym25wh6gk-isl-0.20'

2026-02-06T03:08:50.373467141Z [inf]  deleting '/nix/store/kryrg7ds05iwcmy81amavk8w13y4lxbs-gmp-6.3.0'

2026-02-06T03:08:50.373693739Z [inf]  deleting '/nix/store/qbry6090vlr9ar33kdmmbq2p5apzbga8-expand-response-params'

2026-02-06T03:08:50.3740532Z [inf]  deleting '/nix/store/1m67ipsk39xvhyqrxnzv2m2p48pil8kl-gnu-config-2024-01-01'

2026-02-06T03:08:50.374240227Z [inf]  deleting '/nix/store/1c6bmxrrhm8bd26ai2rjqld2yyjrxhds-glibc-2.40-36-bin'

2026-02-06T03:08:50.374559196Z [inf]  deleting unused links...

2026-02-06T03:08:51.993158314Z [inf]  note: currently hard linking saves 1.67 MiB

2026-02-06T03:08:52.02182042Z [inf]  61 store paths deleted, 559.40 MiB freed

2026-02-06T03:08:52.204660466Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
2026-02-06T03:08:52.207824092Z [inf]  [stage-0  5/10] COPY . /app/.
2026-02-06T03:08:52.287663213Z [inf]  [stage-0  5/10] COPY . /app/.
2026-02-06T03:08:52.289583001Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm ci
2026-02-06T03:08:52.498943635Z [inf]  npm warn config production Use `--omit=dev` instead.

2026-02-06T03:08:53.266510196Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: '@whiskeysockets/baileys@7.0.0-rc.9',
npm warn EBADENGINE   required: { node: '>=20.0.0' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.267444247Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'file-type@21.3.0',
npm warn EBADENGINE   required: { node: '>=20' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.267859472Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'hashery@1.4.0',
npm warn EBADENGINE   required: { node: '>=20' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.268518091Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'lru-cache@11.2.5',
npm warn EBADENGINE   required: { node: '20 || >=22' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.26911506Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'p-queue@9.1.0',
npm warn EBADENGINE   required: { node: '>=20' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.269545804Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'p-timeout@7.0.1',
npm warn EBADENGINE   required: { node: '>=20' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.26985626Z [inf]  npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'qified@0.6.0',
npm warn EBADENGINE   required: { node: '>=20' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }

2026-02-06T03:08:53.286467021Z [inf]  npm error code EUSAGE

2026-02-06T03:08:53.286670326Z [inf]  npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: sharp@0.34.5 from lock file
npm error Missing: @img/colour@1.0.0 from lock file
npm error Missing: @img/sharp-darwin-arm64@0.34.5 from lock file
npm error Missing: @img/sharp-darwin-x64@0.34.5 from lock file
npm error Missing: @img/sharp-libvips-darwin-arm64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-darwin-x64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linux-arm@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linux-arm64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linux-ppc64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linux-riscv64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linux-s390x@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linux-x64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linuxmusl-arm64@1.2.4 from lock file
npm error Missing: @img/sharp-libvips-linuxmusl-x64@1.2.4 from lock file
npm error Missing: @img/sharp-linux-arm@0.34.5 from lock file
npm error Missing: @img/sharp-linux-arm64@0.34.5 from lock file
npm error Missing: @img/sharp-linux-ppc64@0.34.5 from lock file
npm error Missing: @img/sharp-linux-riscv64@0.34.5 from lock file
npm error Missing: @img/sharp-linux-s390x@0.34.5 from lock file
npm error Missing: @img/sharp-linux-x64@0.34.5 from lock file
npm error Missing: @img/sharp-linuxmusl-arm64@0.34.5 from lock file
npm error Missing: @img/sharp-linuxmusl-x64@0.34.5 from lock file
npm error Missing: @img/sharp-wasm32@0.34.5 from lock file
npm error Missing: @img/sharp-win32-arm64@0.34.5 from lock file
npm error Missing: @img/sharp-win32-ia32@0.34.5 from lock file
npm error Missing: @img/sharp-win32-x64@0.34.5 from lock file
npm error Missing: detect-libc@2.1.2 from lock file
npm error Missing: semver@7.7.4 from lock file
npm error Missing: @emnapi/runtime@1.8.1 from lock file
npm error
npm error Clean install a project
npm error
npm error Usage:
npm error npm ci
npm error
npm error Options:
npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
npm error [--no-bin-links] [--no-fund] [--dry-run]
npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
npm error
npm error aliases: clean-install, ic, install-clean, isntall-clean
npm error
npm error Run "npm help ci" for more info

2026-02-06T03:08:53.287974792Z [inf]  npm error A complete log of this run can be found in: /root/.npm/_logs/2026-02-06T03_08_52_467Z-debug-0.log

2026-02-06T03:08:53.347483069Z [err]  [stage-0  6/10] RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm ci
2026-02-06T03:08:53.368603551Z [err]  Dockerfile:20
2026-02-06T03:08:53.368631206Z [err]  -------------------
2026-02-06T03:08:53.368637941Z [err]  18 |     ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH
2026-02-06T03:08:53.368643388Z [err]  19 |     COPY . /app/.
2026-02-06T03:08:53.368650506Z [err]  20 | >>> RUN --mount=type=cache,id=s/f1bd02a3-067c-431b-bf00-6d2f61b79cd9-/root/npm,target=/root/.npm npm ci
2026-02-06T03:08:53.368655001Z [err]  21 |
2026-02-06T03:08:53.368659260Z [err]  22 |     # build phase
2026-02-06T03:08:53.368664379Z [err]  -------------------
2026-02-06T03:08:53.368669734Z [err]  ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c npm ci" did not complete successfully: exit code: 1
2026-02-06T03:08:53.373331575Z [err]  Error: Docker build failed