not_ b t f = b f t
exp_ a b = \ s z -> (b a s z)
odd_ n = n not_ (\ t f -> f)

a = \ s z -> (s (s (s (s (s (s (s (s z))))))))
b = \ s z -> (s (s (s (s (s (s (s (s z))))))))

main :: IO ()
main = print $ odd_ (mul_ a b) True False
