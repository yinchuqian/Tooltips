library(dplyr)
data <- read.csv('gapminder.csv')
data <- filter(data, year == '1980')
write.csv(data, 'data.csv')
