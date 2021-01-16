apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/component: uploader
    app.kubernetes.io/name: pumba-uploader
    app.kubernetes.io/part-of: pumba
    app.kubernetes.io/managed-by: argocd
  name: pumba-uploader
  namespace: pumba
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: pumba-uploader
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app.kubernetes.io/name: pumba-uploader
    spec:
      containers:
      - image: gcr.io/GOOGLE_CLOUD_PROJECT/pumba-uploader:COMMIT_SHA
        name: pumba-uploader
        ports:
        - containerPort: 5000
          protocol: TCP
        resources:
          requests:
              memory: "50Mi"
              cpu: "50m"
          limits:
              memory: "250Mi"
              cpu: "250m"
