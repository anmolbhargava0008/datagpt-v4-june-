<!-- first step 
(While creating a new image dont forget to change this name anmolbhargava07/sbi-ui to anmolbhargava07/new-name) --> 
docker build -t anmolbhargava07/edelweiss-datagpt-ui:latest .

<!-- second step -->
docker push anmolbhargava07/edelweiss-datagpt-ui:latest

<!-- Third step -->
docker buildx ls
 
<!-- Fourth step -->


 <!-- If error comes (for ex : multi-platform issue, then run other command) -->
 docker buildx create --use

 <!-- Then again run  -->
docker buildx build --platform linux/amd64,linux/arm64 -t anmolbhargava07/edelweiss-datagpt-ui:latest --push .

<!-- run the docker app in local-->
docker run -p 9595:9595 anmolbhargava07/edelweiss-datagpt-ui:latest 